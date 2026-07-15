package handlers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"taskflow-backend/internal/models"
)

func TestGetTasks_Unauthenticated(t *testing.T) {
	router := setupTestRouter()
	w := doRequest(router, http.MethodGet, "/api/tasks", nil, "")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestGetTasks_InvalidToken(t *testing.T) {
	router := setupTestRouter()
	w := doRequest(router, http.MethodGet, "/api/tasks", nil, "this.is.not.a.valid.token")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestGetTasks_ReturnsEmptyArray(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)

	w := doRequest(router, http.MethodGet, "/api/tasks", nil, token)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d — body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Data []models.Task `json:"data"`
	}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	// Must return [] not null
	if resp.Data == nil {
		t.Fatal("expected empty array, got null")
	}
}

func TestCreateTask_Success(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)

	w := doRequest(router, http.MethodPost, "/api/tasks", map[string]any{
		"title":       "Buy groceries",
		"description": "Milk, eggs, bread",
		"priority":    "HIGH",
		"label":       "Shopping",
	}, token)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d — body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Data models.Task `json:"data"`
	}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp.Data.ID == "" {
		t.Fatal("expected task ID in response")
	}
	if resp.Data.Title != "Buy groceries" {
		t.Fatalf("expected title 'Buy groceries', got %q", resp.Data.Title)
	}
}

func TestCreateTask_MissingTitle(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)

	w := doRequest(router, http.MethodPost, "/api/tasks", map[string]any{
		"description": "No title provided",
	}, token)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestCreateTask_DefaultPriority(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)

	w := doRequest(router, http.MethodPost, "/api/tasks", map[string]any{
		"title": "Task with no priority",
	}, token)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d — body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Data models.Task `json:"data"`
	}
	json.NewDecoder(w.Body).Decode(&resp)
	if resp.Data.Priority != "NONE" {
		t.Fatalf("expected default priority 'NONE', got %q", resp.Data.Priority)
	}
}

func TestUpdateTask_Success(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)
	taskID := createTaskAndGetID(t, router, token, "Original title")

	completed := true
	w := doRequest(router, http.MethodPut, "/api/tasks/"+taskID, map[string]any{
		"completed": completed,
		"title":     "Updated title",
	}, token)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d — body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Data models.Task `json:"data"`
	}
	json.NewDecoder(w.Body).Decode(&resp)
	if !resp.Data.Completed {
		t.Fatal("expected completed=true after update")
	}
	if resp.Data.Title != "Updated title" {
		t.Fatalf("expected updated title, got %q", resp.Data.Title)
	}
}

func TestUpdateTask_NotFound(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)

	w := doRequest(router, http.MethodPut, "/api/tasks/00000000-0000-0000-0000-000000000000", map[string]any{
		"title": "Ghost",
	}, token)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

func TestDeleteTask_Success(t *testing.T) {
	router := setupTestRouter()
	token := registerAndLogin(t, router)
	taskID := createTaskAndGetID(t, router, token, "To be deleted")

	w := doRequest(router, http.MethodDelete, "/api/tasks/"+taskID, nil, token)
	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", w.Code)
	}

	// Confirm it's gone
	wGet := doRequest(router, http.MethodGet, "/api/tasks", nil, token)
	var resp struct {
		Data []models.Task `json:"data"`
	}
	json.NewDecoder(wGet.Body).Decode(&resp)
	for _, task := range resp.Data {
		if task.ID == taskID {
			t.Fatal("task still present after delete")
		}
	}
}

// TestDeleteTask_OtherUsersTask verifies that user B cannot delete user A's task.
// Must return 404 (not 403) to avoid confirming the task exists.
func TestDeleteTask_OtherUsersTask(t *testing.T) {
	router := setupTestRouter()

	tokenA := registerAndLogin(t, router)
	taskID := createTaskAndGetID(t, router, tokenA, "User A's private task")

	tokenB := registerAndLogin(t, router)
	w := doRequest(router, http.MethodDelete, "/api/tasks/"+taskID, nil, tokenB)

	if w.Code == http.StatusForbidden {
		t.Fatal("SECURITY: got 403 which confirms task existence — must return 404")
	}
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d — body: %s", w.Code, w.Body.String())
	}
}

// TestUpdateTask_OtherUsersTask verifies cross-user update is also blocked with 404.
func TestUpdateTask_OtherUsersTask(t *testing.T) {
	router := setupTestRouter()

	tokenA := registerAndLogin(t, router)
	taskID := createTaskAndGetID(t, router, tokenA, "User A's task")

	tokenB := registerAndLogin(t, router)
	w := doRequest(router, http.MethodPut, "/api/tasks/"+taskID, map[string]any{
		"title": "Hijacked",
	}, tokenB)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 (ownership mismatch), got %d", w.Code)
	}
}

// TestGetTasks_IsolatedPerUser verifies users only see their own tasks.
func TestGetTasks_IsolatedPerUser(t *testing.T) {
	router := setupTestRouter()

	tokenA := registerAndLogin(t, router)
	createTaskAndGetID(t, router, tokenA, "User A task")

	tokenB := registerAndLogin(t, router)
	w := doRequest(router, http.MethodGet, "/api/tasks", nil, tokenB)

	var resp struct {
		Data []models.Task `json:"data"`
	}
	json.NewDecoder(w.Body).Decode(&resp)
	for _, task := range resp.Data {
		if task.Title == "User A task" {
			t.Fatal("SECURITY: user B can see user A's task")
		}
	}
}
