package main

import "database/sql"

// insertCommentImage records an uploaded image for a comment within the
// caller's transaction.
func insertCommentImage(tx *sql.Tx, commentUUID, filename, contentType string) error {
	_, err := tx.Exec(
		`INSERT INTO comment_image (comment_uuid, filename, content_type)
		 VALUES ($1, $2, $3)`,
		commentUUID, filename, contentType,
	)
	return err
}

// queryCommentImagesByPoint returns every comment image belonging to a point's
// comments, oldest first.
func queryCommentImagesByPoint(pointUUID string) ([]CommentImage, error) {
	rows, err := DB.Query(
		`SELECT ci.id, ci.uuid, ci.comment_uuid, ci.filename, ci.content_type, ci.created
		 FROM comment_image ci
		 JOIN comment c ON c.uuid = ci.comment_uuid
		 WHERE c.point_uuid = $1
		 ORDER BY ci.created ASC`,
		pointUUID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	images := []CommentImage{}
	for rows.Next() {
		var img CommentImage
		var contentType sql.NullString
		if err := rows.Scan(&img.ID, &img.UUID, &img.CommentUUID, &img.Filename, &contentType, &img.Created); err != nil {
			return nil, err
		}
		img.ContentType = contentType.String
		images = append(images, img)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return images, nil
}

// commentImageFilenamesByPoint returns the stored filenames of all images for a
// point's comments, so the files can be removed from disk after deletion.
func commentImageFilenamesByPoint(pointUUID string) ([]string, error) {
	return queryImageFilenames(
		`SELECT ci.filename
		 FROM comment_image ci
		 JOIN comment c ON c.uuid = ci.comment_uuid
		 WHERE c.point_uuid = $1`,
		pointUUID,
	)
}

// commentImageFilenamesByProject returns the stored filenames of all images for
// every comment in a project.
func commentImageFilenamesByProject(projectUUID string) ([]string, error) {
	return queryImageFilenames(
		`SELECT ci.filename
		 FROM comment_image ci
		 JOIN comment c ON c.uuid = ci.comment_uuid
		 JOIN point p ON p.uuid = c.point_uuid
		 WHERE p.project_uuid = $1`,
		projectUUID,
	)
}

func queryImageFilenames(query, arg string) ([]string, error) {
	rows, err := DB.Query(query, arg)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var names []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		names = append(names, name)
	}
	return names, rows.Err()
}

// deleteCommentImagesByPoint deletes image rows for a point's comments within
// the caller's transaction.
func deleteCommentImagesByPoint(tx *sql.Tx, pointUUID string) error {
	_, err := tx.Exec(
		`DELETE FROM comment_image
		 WHERE comment_uuid IN (SELECT uuid FROM comment WHERE point_uuid = $1)`,
		pointUUID,
	)
	return err
}

// deleteCommentImagesByProject deletes image rows for every comment in a
// project, within the caller's transaction.
func deleteCommentImagesByProject(tx *sql.Tx, projectUUID string) error {
	_, err := tx.Exec(
		`DELETE FROM comment_image
		 WHERE comment_uuid IN (
		     SELECT c.uuid FROM comment c
		     JOIN point p ON p.uuid = c.point_uuid
		     WHERE p.project_uuid = $1
		 )`,
		projectUUID,
	)
	return err
}
