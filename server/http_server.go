package main

import "github.com/gin-gonic/gin"

func runHttp() {
	router := gin.Default()
	router.GET("/test", getTestData)
	router.POST("/add-points", createPoints)
	router.GET("/points", getPoints)
	router.PUT("/points/:uuid", updatePoint)
	router.DELETE("/points/:uuid", deletePoint)
	router.GET("/projects", getProjects)
	router.POST("/projects", createProject)
	router.DELETE("/projects/:uuid", deleteProject)
	router.GET("/point-types", getPointTypes)
	router.POST("/point-types", createPointType)
	router.Run("localhost:8080")
}
