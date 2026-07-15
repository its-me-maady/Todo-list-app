package middleware

import (
	"net/http"
	"strings"

	"taskflow-backend/internal/services"
	"taskflow-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// Auth returns a Gin middleware that validates Bearer JWTs.
// It sets "user_id" and "email" in the context for downstream handlers.
// Only applied to /api/* routes — public routes remain unauthenticated.
func Auth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Error(c, http.StatusUnauthorized, "authorization header required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			utils.Error(c, http.StatusUnauthorized, "invalid authorization format")
			c.Abort()
			return
		}

		claims, err := services.ParseToken(parts[1], jwtSecret)
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}
