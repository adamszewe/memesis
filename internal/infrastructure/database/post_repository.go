package database

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"memesis/internal/entity"
	"memesis/internal/repo"
)

// Ensure PostgresPostRepository implements PostRepository interface
var _ repo.PostRepository = (*PostgresPostRepository)(nil)

// PostgresPostRepository implements PostRepository using PostgreSQL
type PostgresPostRepository struct {
	pool *pgxpool.Pool
}

// NewPostgresPostRepository creates a new PostgreSQL post repository
func NewPostgresPostRepository(pool *pgxpool.Pool) *PostgresPostRepository {
	return &PostgresPostRepository{
		pool: pool,
	}
}

// Create creates a new post
func (r *PostgresPostRepository) Create(ctx context.Context, post *entity.Post) error {
	tagNames := make([]string, len(post.Tags))
	for i, tag := range post.Tags {
		tagNames[i] = tag.Name
	}

	query := `
		INSERT INTO posts (id, title, image_url, description, created_at, tags)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.pool.Exec(ctx, query,
		post.Id,
		post.Title,
		post.ImageUrl,
		post.Description,
		post.CreatedAt,
		tagNames,
	)

	if err != nil {
		return fmt.Errorf("failed to create post: %w", err)
	}

	return nil
}

// FindByID retrieves a post by its ID
func (r *PostgresPostRepository) FindByID(ctx context.Context, id string) (*entity.Post, error) {
	query := `
		SELECT id, title, image_url, description, created_at, tags
		FROM posts
		WHERE id = $1
	`

	var post entity.Post
	var tagNames []string

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&post.Id,
		&post.Title,
		&post.ImageUrl,
		&post.Description,
		&post.CreatedAt,
		&tagNames,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("post not found: %s", id)
		}
		return nil, fmt.Errorf("failed to find post: %w", err)
	}

	// Convert tag names to Tag entities
	post.Tags = make([]entity.Tag, len(tagNames))
	for i, name := range tagNames {
		post.Tags[i] = entity.Tag{Name: name}
	}

	return &post, nil
}

// FindAll retrieves all posts with pagination
func (r *PostgresPostRepository) FindAll(ctx context.Context, limit, offset int) ([]*entity.Post, error) {
	query := `
		SELECT id, title, image_url, description, created_at, tags
		FROM posts
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts: %w", err)
	}
	defer rows.Close()

	var posts []*entity.Post

	for rows.Next() {
		var post entity.Post
		var tagNames []string

		err := rows.Scan(
			&post.Id,
			&post.Title,
			&post.ImageUrl,
			&post.Description,
			&post.CreatedAt,
			&tagNames,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}

		// Convert tag names to Tag entities
		post.Tags = make([]entity.Tag, len(tagNames))
		for i, name := range tagNames {
			post.Tags[i] = entity.Tag{Name: name}
		}

		posts = append(posts, &post)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating posts: %w", err)
	}

	return posts, nil
}

// FindByTag retrieves posts that have a specific tag
func (r *PostgresPostRepository) FindByTag(ctx context.Context, tag string, limit, offset int) ([]*entity.Post, error) {
	query := `
		SELECT id, title, image_url, description, created_at, tags
		FROM posts
		WHERE $1 = ANY(tags)
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.pool.Query(ctx, query, tag, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts by tag: %w", err)
	}
	defer rows.Close()

	var posts []*entity.Post

	for rows.Next() {
		var post entity.Post
		var tagNames []string

		err := rows.Scan(
			&post.Id,
			&post.Title,
			&post.ImageUrl,
			&post.Description,
			&post.CreatedAt,
			&tagNames,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}

		// Convert tag names to Tag entities
		post.Tags = make([]entity.Tag, len(tagNames))
		for i, name := range tagNames {
			post.Tags[i] = entity.Tag{Name: name}
		}

		posts = append(posts, &post)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating posts: %w", err)
	}

	return posts, nil
}

// Update updates an existing post
func (r *PostgresPostRepository) Update(ctx context.Context, post *entity.Post) error {
	tagNames := make([]string, len(post.Tags))
	for i, tag := range post.Tags {
		tagNames[i] = tag.Name
	}

	query := `
		UPDATE posts
		SET title = $2, image_url = $3, description = $4, tags = $5
		WHERE id = $1
	`

	result, err := r.pool.Exec(ctx, query,
		post.Id,
		post.Title,
		post.ImageUrl,
		post.Description,
		tagNames,
	)

	if err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("post not found: %s", post.Id)
	}

	return nil
}

// Delete deletes a post by its ID
func (r *PostgresPostRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM posts WHERE id = $1`

	result, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("post not found: %s", id)
	}

	return nil
}

// GetAllTags retrieves all unique tags with their counts
func (r *PostgresPostRepository) GetAllTags(ctx context.Context) (map[string]int, error) {
	query := `
		SELECT unnest(tags) as tag, COUNT(*) as count
		FROM posts
		GROUP BY tag
		ORDER BY count DESC
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query tags: %w", err)
	}
	defer rows.Close()

	tags := make(map[string]int)

	for rows.Next() {
		var tag string
		var count int

		err := rows.Scan(&tag, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}

		tags[tag] = count
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating tags: %w", err)
	}

	return tags, nil
}
