package main

import (
	"database/sql"
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
	const cols = 6
	args := make([]interface{}, 0, len(input)*cols)
	b.WriteString("INSERT INTO point (name, type, description, latitude, longitude, project_uuid) VALUES ")

	for i, p := range input {
		if i > 0 {
			b.WriteString(", ")
		}
		n := i * cols
		fmt.Fprintf(&b, "($%d, $%d, $%d, $%d, $%d, $%d)",
			n+1, n+2, n+3, n+4, n+5, n+6)

		var projectArg any
		if p.ProjectUUID != "" {
			projectArg = p.ProjectUUID
		}
		args = append(args, p.Name, p.Type, p.Description, p.Latitude, p.Longitude, projectArg)
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

func getProjects(c *gin.Context) {
	userUUID := strings.TrimSpace(c.Query("userUuid"))

	var (
		userArg any = nil
	)
	if userUUID != "" {
		userArg = userUUID
	}

	rows, err := DB.Query(
		`SELECT id, uuid, name, description, user_uuid, is_public
		 FROM project
		 WHERE is_public = TRUE OR user_uuid = $1`,
		userArg,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		var p Project
		var description sql.NullString
		if err := rows.Scan(&p.ID, &p.UUID, &p.Name, &description, &p.UserUUID, &p.IsPublic); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		p.Description = description.String
		projects = append(projects, p)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func createProject(c *gin.Context) {
	var p Project
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(p.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	userUUID := strings.TrimSpace(p.UserUUID)
	if userUUID == "" {
		if err := DB.QueryRow(
			`SELECT uuid FROM users WHERE user_email = $1`,
			"sample@example.com",
		).Scan(&userUUID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "no default user available"})
			return
		}
	}

	var newUUID string
	err := DB.QueryRow(
		`INSERT INTO project (name, description, user_uuid, is_public)
		 VALUES ($1, $2, $3, $4)
		 RETURNING uuid`,
		p.Name, p.Description, userUUID, p.IsPublic,
	).Scan(&newUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	p.UUID = newUUID
	p.UserUUID = userUUID
	c.JSON(http.StatusCreated, p)
}

func getPoints(c *gin.Context) {
	projectUUID := strings.TrimSpace(c.Query("projectUuid"))

	var (
		rows *sql.Rows
		err  error
	)
	if projectUUID != "" {
		rows, err = DB.Query(
			`SELECT id, uuid, name, type, description, latitude, longitude, project_uuid, created, updated
			 FROM point WHERE project_uuid = $1`,
			projectUUID,
		)
	} else {
		rows, err = DB.Query(
			`SELECT id, uuid, name, type, description, latitude, longitude, project_uuid, created, updated FROM point`,
		)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	points := []Point{}
	for rows.Next() {
		var p Point
		var name, ptype, description sql.NullString
		var projectUUIDVal sql.NullString
		if err := rows.Scan(&p.ID, &p.UUID, &name, &ptype, &description, &p.Latitude, &p.Longitude, &projectUUIDVal, &p.Created, &p.Updated); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		p.Name = name.String
		p.Type = ptype.String
		p.Description = description.String
		p.ProjectUUID = projectUUIDVal.String
		points = append(points, p)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, points)
}

func updatePoint(c *gin.Context) {
	uuid := strings.TrimSpace(c.Param("uuid"))
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing uuid"})
		return
	}

	var p Point
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := DB.Exec(
		`UPDATE point
		 SET name = $1, type = $2, description = $3, latitude = $4, longitude = $5, updated = NOW()
		 WHERE uuid = $6`,
		p.Name, p.Type, p.Description, p.Latitude, p.Longitude, uuid,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, err := res.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "point not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}
