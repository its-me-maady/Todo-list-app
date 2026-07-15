package handlers

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"strings"

	"taskflow-backend/internal/models"
	"taskflow-backend/internal/services"
	"taskflow-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// AuthHandler handles user registration and login.
type AuthHandler struct {
	db        *sqlx.DB
	jwtSecret string
}

// NewAuthHandler wires up the handler with DB and config.
func NewAuthHandler(db *sqlx.DB, cfg *utils.Config) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: cfg.JWTSecret}
}

type registerInput struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// Register creates a new user account.
// On duplicate email we return the same generic 400 as any other bad request
// to prevent email enumeration attacks.
func (h *AuthHandler) Register(c *gin.Context) {
	var input registerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request")
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	hash, err := services.HashPassword(input.Password)
	if err != nil {
		log.Printf("register: bcrypt error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}

	var user models.User
	err = h.db.QueryRowx(
		`INSERT INTO users (email, password_hash, name, picture) VALUES ($1, $2, '', '') RETURNING id, email, created_at`,
		input.Email, hash,
	).StructScan(&user)
	if err != nil {
		// Do NOT distinguish duplicate email from other errors — prevents enumeration.
		log.Printf("register: insert error: %v", err)
		utils.Error(c, http.StatusBadRequest, "invalid request")
		return
	}

	utils.Success(c, http.StatusCreated, user)
}

type loginInput struct {
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login validates credentials and returns a signed JWT on success.
func (h *AuthHandler) Login(c *gin.Context) {
	var input loginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request")
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var user models.User
	err := h.db.QueryRowx(
		`SELECT id, email, password_hash, created_at FROM users WHERE email = $1`,
		input.Email,
	).StructScan(&user)
	if errors.Is(err, sql.ErrNoRows) {
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		log.Printf("login: db error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}

	if err := services.CheckPassword(user.PasswordHash, input.Password); err != nil {
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := services.GenerateToken(user.ID, user.Email, h.jwtSecret)
	if err != nil {
		log.Printf("login: token generation error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"token": token,
		"user":  gin.H{"id": user.ID, "email": user.Email},
	})
}
