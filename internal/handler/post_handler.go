package handler

import (
	"net/http"
	"strconv"
	"strings"

	"memesis/internal/repo"

	"github.com/gin-gonic/gin"
)

const (
	PageSize = 25
	MaxPage  = 10000 // Maximum page number to prevent overflow
	MaxIDLen = 100   // Maximum length for post ID
)

type PostHandler struct {
	postRepo repo.PostRepository
}

func NewPostHandler(postRepo repo.PostRepository) *PostHandler {
	return &PostHandler{
		postRepo: postRepo,
	}
}

// PostsResponse represents the paginated response structure
type PostsResponse struct {
	Posts      interface{} `json:"posts"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalShown int         `json:"total_shown"`
}

// GetPosts handles GET /posts?page=1
func (h *PostHandler) GetPosts(c *gin.Context) {
	// Parse page parameter, default to 1
	pageStr := c.DefaultQuery("page", "1")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page parameter"})
		return
	}

	// Validate maximum page to prevent integer overflow
	if page > MaxPage {
		c.JSON(http.StatusBadRequest, gin.H{"error": "page parameter exceeds maximum allowed value"})
		return
	}

	// Calculate offset
	offset := (page - 1) * PageSize

	// Fetch posts from repository
	posts, err := h.postRepo.FindAll(c.Request.Context(), PageSize, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}

	// Return paginated response
	response := PostsResponse{
		Posts:      posts,
		Page:       page,
		PageSize:   PageSize,
		TotalShown: len(posts),
	}

	c.JSON(http.StatusOK, response)
}

// GetPostByID handles GET /posts/:id
func (h *PostHandler) GetPostByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "post id is required"})
		return
	}

	// Validate ID length to prevent abuse
	if len(id) > MaxIDLen {
		c.JSON(http.StatusBadRequest, gin.H{"error": "post id exceeds maximum length"})
		return
	}

	// Validate ID format (alphanumeric, hyphens, underscores only)
	id = strings.TrimSpace(id)
	if !isValidID(id) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id format"})
		return
	}

	// Fetch post from the repository
	post, err := h.postRepo.FindByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

// isValidID checks if the ID contains only safe characters
func isValidID(id string) bool {
	if len(id) == 0 {
		return false
	}
	for _, char := range id {
		if !((char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') ||
			char == '-' || char == '_') {
			return false
		}
	}
	return true
}
