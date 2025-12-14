package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"memesis/internal/handler"
	"memesis/internal/infrastructure/database"

	"github.com/gin-gonic/gin"
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

	// Health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong-pong")
	})

	// Posts endpoints
	r.GET("/posts", postHandler.GetPosts)

	// Start server
	fmt.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
