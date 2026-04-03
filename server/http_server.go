package main

import "github.com/gin-gonic/gin"

func runHttp() {
	router := gin.Default()
	router.GET("/test", getTestData)
	router.Run("localhost:8080")
}
