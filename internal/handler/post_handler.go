package handler

import (
	"net/http"
	"strconv"

	"memesis/internal/repo"

	"github.com/gin-gonic/gin"
)

const PageSize = 25

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
