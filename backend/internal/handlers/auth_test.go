package handlers_test

import (
	"net/http"
	"testing"
)

func TestRegister_Success(t *testing.T) {
	router := setupTestRouter()
	w := registerUser(t, router, uniqueEmail(), "Password123")
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d — body: %s", w.Code, w.Body.String())
	}
}

func TestRegister_InvalidEmail(t *testing.T) {
	router := setupTestRouter()
	w := registerUser(t, router, "not-an-email", "Password123")
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestRegister_ShortPassword(t *testing.T) {
	router := setupTestRouter()
	w := registerUser(t, router, uniqueEmail(), "short")
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

// TestRegister_DuplicateEmail_DoesNotReveal verifies that registering a
// duplicate email returns 400 (not 409) to prevent email enumeration.
func TestRegister_DuplicateEmail_DoesNotReveal(t *testing.T) {
	router := setupTestRouter()
	email := uniqueEmail()

	w := registerUser(t, router, email, "Password123")
	if w.Code != http.StatusCreated {
		t.Fatalf("first register: expected 201, got %d", w.Code)
	}

	w = registerUser(t, router, email, "DifferentPass456")
	if w.Code == http.StatusConflict {
		t.Fatal("SECURITY: leaked email existence via 409 — must not return 409")
	}
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d — body: %s", w.Code, w.Body.String())
	}
}

func TestLogin_Success(t *testing.T) {
	router := setupTestRouter()
	email := uniqueEmail()

	registerUser(t, router, email, "Password123")
	token := loginAndGetToken(t, router, email, "Password123")
	if token == "" {
		t.Fatal("expected non-empty token")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	router := setupTestRouter()
	email := uniqueEmail()

	registerUser(t, router, email, "Password123")
	w := doRequest(router, http.MethodPost, "/auth/login", map[string]string{
		"email": email, "password": "WrongPassword",
	}, "")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestLogin_UnknownEmail(t *testing.T) {
	router := setupTestRouter()
	w := doRequest(router, http.MethodPost, "/auth/login", map[string]string{
		"email": "nobody@test.taskflow", "password": "Password123",
	}, "")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

// TestLogin_SameErrorForBadEmailAndBadPassword ensures the response body is
// identical regardless of whether the email exists — prevents enumeration via login.
func TestLogin_SameErrorForBadEmailAndBadPassword(t *testing.T) {
	router := setupTestRouter()
	email := uniqueEmail()
	registerUser(t, router, email, "Password123")

	wUnknown := doRequest(router, http.MethodPost, "/auth/login", map[string]string{
		"email": "ghost@test.taskflow", "password": "anything",
	}, "")
	wBadPass := doRequest(router, http.MethodPost, "/auth/login", map[string]string{
		"email": email, "password": "wrongpass",
	}, "")

	if wUnknown.Body.String() != wBadPass.Body.String() {
		t.Fatalf("SECURITY: login error body differs between unknown email and wrong password\nunknown: %s\nbad pass: %s",
			wUnknown.Body.String(), wBadPass.Body.String())
	}
}

func TestLogin_MissingFields(t *testing.T) {
	router := setupTestRouter()
	w := doRequest(router, http.MethodPost, "/auth/login", map[string]string{
		"email": "test@test.taskflow",
	}, "")
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}
