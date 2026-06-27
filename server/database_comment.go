package main

import (
	"database/sql"
	"time"
)

// queryCommentsByPoint returns a point's comments (newest first) with their
// images attached.
func queryCommentsByPoint(pointUUID string) ([]Comment, error) {
	rows, err := DB.Query(
		`SELECT id, uuid, point_uuid, comment_text, created
		 FROM comment
		 WHERE point_uuid = $1
		 ORDER BY created DESC`,
		pointUUID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []Comment{}
	byUUID := map[string]int{} // comment uuid -> index in comments
	for rows.Next() {
		var cm Comment
		var text sql.NullString
		if err := rows.Scan(&cm.ID, &cm.UUID, &cm.PointUUID, &text, &cm.Created); err != nil {
			return nil, err
		}
		cm.CommentText = text.String
		cm.Images = []CommentImage{}
		byUUID[cm.UUID] = len(comments)
		comments = append(comments, cm)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(comments) == 0 {
		return comments, nil
	}

	images, err := queryCommentImagesByPoint(pointUUID)
	if err != nil {
		return nil, err
	}
	for _, img := range images {
		if idx, ok := byUUID[img.CommentUUID]; ok {
			comments[idx].Images = append(comments[idx].Images, img)
		}
	}

	return comments, nil
}

// insertComment inserts a comment within the caller's transaction and returns
// its new UUID and DB-generated creation time.
func insertComment(tx *sql.Tx, pointUUID, text string) (string, time.Time, error) {
	var (
		newUUID string
		created time.Time
	)
	err := tx.QueryRow(
		`INSERT INTO comment (point_uuid, comment_text)
		 VALUES ($1, $2)
		 RETURNING uuid, created`,
		pointUUID, text,
	).Scan(&newUUID, &created)
	return newUUID, created, err
}

// deleteCommentsByPoint deletes all comments for a point within the caller's
// transaction.
func deleteCommentsByPoint(tx *sql.Tx, pointUUID string) error {
	_, err := tx.Exec(`DELETE FROM comment WHERE point_uuid = $1`, pointUUID)
	return err
}

// deleteCommentsByProject deletes all comments for every point in a project,
// within the caller's transaction.
func deleteCommentsByProject(tx *sql.Tx, projectUUID string) error {
	_, err := tx.Exec(
		`DELETE FROM comment
		 WHERE point_uuid IN (SELECT uuid FROM point WHERE project_uuid = $1)`,
		projectUUID,
	)
	return err
}
