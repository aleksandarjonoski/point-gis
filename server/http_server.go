package main

import "github.com/gin-gonic/gin"

func runHttp() {
	ensureUploadDirs()

	router := gin.Default()
	// Bound how much of a multipart upload is buffered in memory before
	// spilling to temp files (this is not a hard upload limit — that is
	// enforced per-request in createComment).
	router.MaxMultipartMemory = maxImageSize

	router.GET("/test", getTestData)
	router.POST("/add-points", createPoints)
	router.GET("/points", getPoints)
	router.PUT("/points/:uuid", updatePoint)
	router.DELETE("/points/:uuid", deletePoint)
	router.GET("/points/:uuid/comments", getComments)
	router.POST("/points/:uuid/comments", createComment)
	router.Static("/comment-images", commentImagesDir)
	router.GET("/projects", getProjects)
	router.POST("/projects", createProject)
	router.PUT("/projects/:uuid", updateProject)
	router.DELETE("/projects/:uuid", deleteProject)
	router.GET("/point-types", getPointTypes)
	router.POST("/point-types", createPointType)
	router.PUT("/point-types/:uuid", updatePointType)
	router.Run("localhost:8080")
}
