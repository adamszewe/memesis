package main

import (
	"fmt"
	"net/http"

	"memesis/internal/entity"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong-pong")
	})
	s := "gopher"
	fmt.Printf("Hello and welcome, %s!\n", s)

	post := entity.Post{
		Id:          0,
		Title:       "",
		ImageUrl:    "",
		Description: "",
		CreatedAt:   "",
	}

	for i := 1; i <= 5; i++ {
		fmt.Println("i =", 100/i)
		doggo(post)
	}

	err := r.Run(":8080")
	if err != nil {
		return
	}
}

// wtf is this thing?
func doggo(post entity.Post) {
	i := 10
	fmt.Println(i)
	fmt.Println(post)
}
