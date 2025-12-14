package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"memesis/internal/infrastructure/database"
)

func main() {
	ctx := context.Background()

	// Load database configuration
	dbConfig := database.LoadConfigFromEnv()

	// Connect to database
	pool, err := database.NewPostgresPool(ctx, dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	fmt.Println("Connected to database successfully")

	// Read the seed SQL file
	seedFile := "seeds/dev_posts.sql"
	sql, err := os.ReadFile(seedFile)
	if err != nil {
		log.Fatalf("Failed to read seed file %s: %v", seedFile, err)
	}

	// Execute the seed SQL
	fmt.Println("Seeding database...")
	_, err = pool.Exec(ctx, string(sql))
	if err != nil {
		log.Fatalf("Failed to execute seed SQL: %v", err)
	}

	fmt.Println("✓ Database seeded successfully with sample posts!")
	fmt.Println("Run 'go run seeds/seed.go' to re-seed the database anytime")
}
