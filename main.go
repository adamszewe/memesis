package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong-pong")
	})
	s := "gopher"
	fmt.Printf("Hello and welcome, %s!\n", s)

	for i := 1; i <= 5; i++ {
		fmt.Println("i =", 100/i)
		doggo()
	}

	err := r.Run(":8080")
	if err != nil {
		return
	}
}

// wtf is this thing?
func doggo() {
	i := 10
	fmt.Println(i)
}
