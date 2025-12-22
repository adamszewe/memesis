package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"memesis/internal/handler"
	"memesis/internal/infrastructure/database"
	"memesis/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func main() {
	ctx := context.Background()

	// Initialize database connection pool
	dbConfig := database.LoadConfigFromEnv()
	pool, err := database.NewPostgresPool(ctx, dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	fmt.Println("Successfully connected to database!")

	// Initialize repository
	postRepo := database.NewPostgresPostRepository(pool)

	// Initialize handler
	postHandler := handler.NewPostHandler(postRepo)

	// Setup router
	r := gin.Default()

	// CORS configuration - restrict to your frontend domain in production
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))

	// Security headers middleware
	r.Use(middleware.SecurityHeaders())

	// Rate limiting: 10 requests per second with burst of 20
	rateLimiter := middleware.NewRateLimiter(rate.Limit(10), 20)
	rateLimiter.Cleanup(5 * time.Minute)
	r.Use(rateLimiter.Middleware())

	// Health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong-pong")
	})

	// Posts endpoints
	r.GET("/posts", postHandler.GetPosts)
	r.GET("/posts/:id", postHandler.GetPostByID)

	// Start server
	fmt.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
