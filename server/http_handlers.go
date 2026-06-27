package main

import (
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

	if err := insertPoints(input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "count": len(input)})
}

func getProjects(c *gin.Context) {
	userUUID := strings.TrimSpace(c.Query("userUuid"))

	projects, err := queryProjects(userUUID)
	if err != nil {
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
		var err error
		userUUID, err = userUUIDByEmail("sample@example.com")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "no default user available"})
			return
		}
	}

	newUUID, err := insertProject(p, userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	p.UUID = newUUID
	p.UserUUID = userUUID
	c.JSON(http.StatusCreated, p)
}

func getPointTypes(c *gin.Context) {
	projectUUID := strings.TrimSpace(c.Query("projectUuid"))
	if projectUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "projectUuid is required"})
		return
	}

	types, err := queryPointTypes(projectUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, types)
}

func createPointType(c *gin.Context) {
	var pt PointType
	if err := c.ShouldBindJSON(&pt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(pt.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}
	if strings.TrimSpace(pt.ProjectUUID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "projectUuid is required"})
		return
	}

	newUUID, err := insertPointType(pt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	pt.UUID = newUUID
	c.JSON(http.StatusCreated, pt)
}

func getPoints(c *gin.Context) {
	projectUUID := strings.TrimSpace(c.Query("projectUuid"))

	points, err := queryPoints(projectUUID)
	if err != nil {
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

	n, err := updatePointByUUID(uuid, p)
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

func deletePoint(c *gin.Context) {
	uuid := strings.TrimSpace(c.Param("uuid"))
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing uuid"})
		return
	}

	n, err := deletePointByUUID(uuid)
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
