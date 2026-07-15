package utils

import "github.com/gin-gonic/gin"

// Success sends a consistent { "data": ... } JSON response.
func Success(c *gin.Context, code int, data any) {
	c.JSON(code, gin.H{"data": data})
}

// Error sends a consistent { "error": "..." } JSON response.
func Error(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"error": message})
}
