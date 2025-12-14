package main

import (
	"fmt"
	"net/http"

	"memesis/internal/entity"

	"database/sql"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "memesis_user"
	password = "memesis_password"
	dbname   = "memesis"
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
	}

	// add a postgres connection
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println("Successfully connected!")

	serviceErr := r.Run(":8080")
	if serviceErr != nil {
		return
	}
}

// wtf is this thing?
func doggo(post entity.Post) {
	i := 10
	fmt.Println(i)
	fmt.Println(post)
}
