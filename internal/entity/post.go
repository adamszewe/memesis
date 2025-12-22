package entity

import (
	"time"
)

type Post struct {
	Id          string
	Title       string
	ImageUrl    string
	Description string
	CreatedAt   time.Time // iso date
	Categories  []Category
}

type Category struct {
	Id      string
	Name    string
	IconUrl string
}
