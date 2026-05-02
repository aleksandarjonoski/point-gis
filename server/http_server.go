package main

import "github.com/gin-gonic/gin"

func runHttp() {
	router := gin.Default()
	router.GET("/test", getTestData)
	router.POST("/add-points", createPoints)
	router.GET("/points", getPoints)
	router.PUT("/points/:uuid", updatePoint)
	router.GET("/projects", getProjects)
	router.POST("/projects", createProject)
	router.GET("/point-types", getPointTypes)
	router.POST("/point-types", createPointType)
	router.Run("localhost:8080")
}
