package main

import (
	"log"

	"taskflow-backend/internal/db"
	"taskflow-backend/internal/handlers"
	"taskflow-backend/internal/middleware"
	"taskflow-backend/internal/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env — try current directory first, then parent directory
	if err := godotenv.Load(); err != nil {
		if err := godotenv.Load("../.env"); err != nil {
			log.Println("No .env file found, relying on system environment variables")
		} else {
			log.Println("Loaded environment variables from ../.env")
		}
	} else {
		log.Println("Loaded environment variables from .env")
	}

	cfg := utils.LoadConfig()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer database.Close()

	r := gin.Default()

	// Configure CORS to allow our frontend headers
	r.Use(cors.New(cors.Config{
		AllowOriginFunc:  func(origin string) bool { return true },
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// ── Public routes ──────────────────────────────────────────────────────────
	authHandler := handlers.NewAuthHandler(database, cfg)
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)

	// ── Protected routes (JWT required) ───────────────────────────────────────
	api := r.Group("/api", middleware.Auth(cfg.JWTSecret))
	taskHandler := handlers.NewTaskHandler(database)
	api.GET("/tasks", taskHandler.GetTasks)
	api.POST("/tasks", taskHandler.CreateTask)
	api.PUT("/tasks/:id", taskHandler.UpdateTask)
	api.DELETE("/tasks/:id", taskHandler.DeleteTask)

	log.Printf("TaskFlow backend running on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
