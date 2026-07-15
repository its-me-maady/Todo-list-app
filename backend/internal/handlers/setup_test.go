package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"taskflow-backend/internal/db"
	"taskflow-backend/internal/handlers"
	"taskflow-backend/internal/middleware"
	"taskflow-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
)

var (
	testDB     *sqlx.DB
	testCfg    *utils.Config
	testSecret = "test-secret-key-for-handlers-tests"
)

// TestMain sets up a shared DB connection for all handler tests and cleans up afterwards.
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)

	// Load .env — try from test file location up to project root
	for _, path := range []string{".env", "../../../.env", "../../../../.env"} {
		if err := godotenv.Load(path); err == nil {
			break
		}
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		fmt.Println("DATABASE_URL not set — skipping integration tests")
		os.Exit(0)
	}

	var err error
	testDB, err = db.Connect(databaseURL)
	if err != nil {
		fmt.Printf("failed to connect to test DB: %v\n", err)
		os.Exit(1)
	}
	defer testDB.Close()

	testCfg = &utils.Config{
		JWTSecret:   testSecret,
		Port:        "8080",
		DatabaseURL: databaseURL,
	}

	cleanTestData()
	code := m.Run()
	cleanTestData()

	os.Exit(code)
}

// cleanTestData removes all rows created by tests (identified by @test.taskflow email suffix).
func cleanTestData() {
	testDB.Exec(`DELETE FROM tasks WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.taskflow')`)
	testDB.Exec(`DELETE FROM users WHERE email LIKE '%@test.taskflow'`)
}

// setupTestRouter builds a fresh Gin router wired to the shared test DB.
func setupTestRouter() *gin.Engine {
	r := gin.New()

	authHandler := handlers.NewAuthHandler(testDB, testCfg)
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)

	api := r.Group("/api", middleware.Auth(testCfg.JWTSecret))
	taskHandler := handlers.NewTaskHandler(testDB)
	api.GET("/tasks", taskHandler.GetTasks)
	api.POST("/tasks", taskHandler.CreateTask)
	api.PUT("/tasks/:id", taskHandler.UpdateTask)
	api.DELETE("/tasks/:id", taskHandler.DeleteTask)

	return r
}

// uniqueEmail generates an email that won't collide between parallel test runs.
func uniqueEmail() string {
	return fmt.Sprintf("user-%d@test.taskflow", time.Now().UnixNano())
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func doRequest(router *gin.Engine, method, path string, body any, token string) *httptest.ResponseRecorder {
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func registerUser(t *testing.T, router *gin.Engine, email, password string) *httptest.ResponseRecorder {
	t.Helper()
	return doRequest(router, http.MethodPost, "/auth/register", map[string]string{
		"email": email, "password": password,
	}, "")
}

func loginAndGetToken(t *testing.T, router *gin.Engine, email, password string) string {
	t.Helper()
	w := doRequest(router, http.MethodPost, "/auth/login", map[string]string{
		"email": email, "password": password,
	}, "")
	if w.Code != http.StatusOK {
		t.Fatalf("loginAndGetToken: expected 200, got %d — body: %s", w.Code, w.Body.String())
	}
	var resp struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("loginAndGetToken: failed to decode response: %v", err)
	}
	return resp.Data.Token
}

func registerAndLogin(t *testing.T, router *gin.Engine) string {
	t.Helper()
	email := uniqueEmail()
	w := registerUser(t, router, email, "Password123")
	if w.Code != http.StatusCreated {
		t.Fatalf("registerAndLogin: register failed with %d: %s", w.Code, w.Body.String())
	}
	return loginAndGetToken(t, router, email, "Password123")
}

func createTaskAndGetID(t *testing.T, router *gin.Engine, token, title string) string {
	t.Helper()
	w := doRequest(router, http.MethodPost, "/api/tasks", map[string]string{
		"title": title,
	}, token)
	if w.Code != http.StatusCreated {
		t.Fatalf("createTaskAndGetID: expected 201, got %d — body: %s", w.Code, w.Body.String())
	}
	var resp struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("createTaskAndGetID: failed to decode response: %v", err)
	}
	return resp.Data.ID
}
