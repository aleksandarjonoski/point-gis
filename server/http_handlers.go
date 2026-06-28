package main

import (
	"fmt"
	"mime/multipart"
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

func updateProject(c *gin.Context) {
	uuid := strings.TrimSpace(c.Param("uuid"))
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing uuid"})
		return
	}

	var p Project
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(p.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	n, err := updateProjectByUUID(uuid, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func deleteProject(c *gin.Context) {
	uuid := strings.TrimSpace(c.Param("uuid"))
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing uuid"})
		return
	}

	n, err := deleteProjectByUUID(uuid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
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

func updatePointType(c *gin.Context) {
	uuid := strings.TrimSpace(c.Param("uuid"))
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing uuid"})
		return
	}

	var pt PointType
	if err := c.ShouldBindJSON(&pt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(pt.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	n, err := updatePointTypeByUUID(uuid, pt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "point type not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
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

func getComments(c *gin.Context) {
	pointUUID := strings.TrimSpace(c.Param("uuid"))
	if pointUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing point uuid"})
		return
	}

	comments, err := queryCommentsByPoint(pointUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func createComment(c *gin.Context) {
	pointUUID := strings.TrimSpace(c.Param("uuid"))
	if pointUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing point uuid"})
		return
	}

	// Cap the whole request body as a safety net against oversized uploads.
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxCommentUploadBytes)

	text := strings.TrimSpace(c.PostForm("commentText"))

	var files []*multipart.FileHeader
	if form, err := c.MultipartForm(); err == nil {
		files = form.File["images"]
	}

	if text == "" && len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "comment text or at least one image is required"})
		return
	}

	if len(files) > maxImagesPerComment {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("too many images (max %d)", maxImagesPerComment),
		})
		return
	}
	for _, file := range files {
		if file.Size > maxImageSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": fmt.Sprintf("image %q exceeds the %d MB limit", file.Filename, maxImageSize>>20),
			})
			return
		}
	}

	// Save files to disk first; collect metadata for the DB rows.
	images := make([]CommentImage, 0, len(files))
	savedFilenames := make([]string, 0, len(files))
	for _, file := range files {
		filename, err := saveCommentImage(c, file)
		if err != nil {
			removeCommentImageFiles(savedFilenames)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if filename == "" {
			continue // unsupported file type, skip
		}
		savedFilenames = append(savedFilenames, filename)
		images = append(images, CommentImage{
			Filename:    filename,
			ContentType: file.Header.Get("Content-Type"),
		})
	}

	tx, err := DB.Begin()
	if err != nil {
		removeCommentImageFiles(savedFilenames)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	commentUUID, created, err := insertComment(tx, pointUUID, text)
	if err != nil {
		tx.Rollback()
		removeCommentImageFiles(savedFilenames)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := range images {
		images[i].CommentUUID = commentUUID
		if err := insertCommentImage(tx, commentUUID, images[i].Filename, images[i].ContentType); err != nil {
			tx.Rollback()
			removeCommentImageFiles(savedFilenames)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		removeCommentImageFiles(savedFilenames)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, Comment{
		UUID:        commentUUID,
		PointUUID:   pointUUID,
		CommentText: text,
		Created:     &created,
		Images:      images,
	})
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
