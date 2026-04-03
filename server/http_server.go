package main

import "github.com/gin-gonic/gin"

func runHttp() {
	router := gin.Default()
	router.GET("/test", getTestData)
	router.POST("/add-points", createPoints)
	router.GET("/points", getPoints)
	router.Run("localhost:8080")
}
