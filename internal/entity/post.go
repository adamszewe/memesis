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
	Tags        []Tag
}

type Tag struct {
	Id   string
	Name string
}
