package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func getTestData(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}
