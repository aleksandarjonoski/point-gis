package main

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// commentImagesDir is where uploaded comment images are stored on disk. It is
// served statically (see runHttp) and excluded from version control.
const commentImagesDir = "uploads/comment-images"

const (
	// maxImageSize is the largest a single uploaded image may be.
	maxImageSize = 10 << 20 // 10 MB
	// maxImagesPerComment caps how many images one comment may carry.
	maxImagesPerComment = 10
	// maxCommentUploadBytes bounds the whole multipart request as a safety net.
	maxCommentUploadBytes = maxImagesPerComment*maxImageSize + (1 << 20)
)

// allowedImageExts is the set of file extensions accepted for comment images.
var allowedImageExts = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
	".heic": true,
}

// ensureUploadDirs creates the upload directories if they do not yet exist.
func ensureUploadDirs() {
	if err := os.MkdirAll(commentImagesDir, 0o755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}
}

// randomToken returns a random hex string used to build unique filenames.
func randomToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// saveCommentImage stores an uploaded file under a unique name and returns the
// generated filename. It returns ("", nil) if the file has an unsupported
// extension, so callers can skip it without failing the whole request.
func saveCommentImage(c *gin.Context, file *multipart.FileHeader) (string, error) {
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedImageExts[ext] {
		return "", nil
	}

	token, err := randomToken()
	if err != nil {
		return "", err
	}
	filename := token + ext

	dst := filepath.Join(commentImagesDir, filename)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		return "", err
	}
	return filename, nil
}

// removeCommentImageFiles deletes image files from disk. It is best-effort and
// only logs failures, since it runs after the database rows are already gone.
func removeCommentImageFiles(filenames []string) {
	for _, name := range filenames {
		if name == "" {
			continue
		}
		if err := os.Remove(filepath.Join(commentImagesDir, name)); err != nil && !os.IsNotExist(err) {
			log.Printf("Failed to remove image file %s: %v", name, err)
		}
	}
}
