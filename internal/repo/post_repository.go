package repo

import (
	"context"
	"memesis/internal/entity"
)

// PostRepository defines the interface for post persistence operations
type PostRepository interface {
	// Create creates a new post
	Create(ctx context.Context, post *entity.Post) error

	// FindByID retrieves a post by its ID
	FindByID(ctx context.Context, id string) (*entity.Post, error)

	// FindAll retrieves all posts with pagination
	FindAll(ctx context.Context, limit, offset int) ([]*entity.Post, error)

	// FindByTag retrieves posts that have a specific tag
	FindByTag(ctx context.Context, tag string, limit, offset int) ([]*entity.Post, error)

	// Update updates an existing post
	Update(ctx context.Context, post *entity.Post) error

	// Delete deletes a post by its ID
	Delete(ctx context.Context, id string) error

	// GetAllTags retrieves all unique tags with their counts
	GetAllTags(ctx context.Context) (map[string]int, error)
}
