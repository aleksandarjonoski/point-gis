package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func getTestData(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}

func createPoints(c *gin.Context) {
	var input []Point
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(input) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty array"})
		return
	}

	var b strings.Builder
	args := make([]interface{}, 0, len(input)*4)
	b.WriteString("INSERT INTO point (type, description, latitude, longitude) VALUES ")

	for i, p := range input {
		if i > 0 {
			b.WriteString(", ")
		}
		n := i * 4
		fmt.Fprintf(&b, "($%d, $%d, $%d, $%d)", n+1, n+2, n+3, n+4)
		args = append(args, p.Type, p.Description, p.Latitude, p.Longitude)
	}

	tx, err := DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(b.String(), args...)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "count": len(input)})
}

func getPoints(c *gin.Context) {
	rows, err := DB.Query(
		`SELECT id, uuid, type, description, latitude, longitude, created, updated FROM point`,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var points []Point
	for rows.Next() {
		var p Point
		if err := rows.Scan(&p.ID, &p.UUID, &p.Type, &p.Description, &p.Latitude, &p.Longitude, &p.Created, &p.Updated); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		points = append(points, p)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, points)
}
