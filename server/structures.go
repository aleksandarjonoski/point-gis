package main

import "time"

// album represents data about a record album.
type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

// albums slice to seed record album data.
var albums = []album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

type Point struct {
	ID          int        `json:"id"`
	UUID        string     `json:"uuid"`
	Name        string     `json:"name"`
	Type        string     `json:"type"`
	Description string     `json:"description"`
	Latitude    float64    `json:"latitude"`
	Longitude   float64    `json:"longitude"`
	ProjectUUID string     `json:"projectUuid"`
	Created     *time.Time `json:"created"`
	Updated     *time.Time `json:"updated"`
}

type Project struct {
	ID          int    `json:"id"`
	UUID        string `json:"uuid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserUUID    string `json:"userUuid"`
	IsPublic    bool   `json:"isPublic"`
}

type PointType struct {
	ID          int    `json:"id"`
	UUID        string `json:"uuid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ProjectUUID string `json:"projectUuid"`
}

type Comment struct {
	ID          int            `json:"id"`
	UUID        string         `json:"uuid"`
	PointUUID   string         `json:"pointUuid"`
	CommentText string         `json:"commentText"`
	Created     *time.Time     `json:"created"`
	Images      []CommentImage `json:"images"`
}

type CommentImage struct {
	ID          int        `json:"id"`
	UUID        string     `json:"uuid"`
	CommentUUID string     `json:"commentUuid"`
	Filename    string     `json:"filename"`
	ContentType string     `json:"contentType"`
	Created     *time.Time `json:"created"`
}
