package main

import (
	"database/sql"
	"fmt"
	"strings"
)

// insertPoints bulk-inserts points in a single transaction.
func insertPoints(points []Point) error {
	var b strings.Builder
	const cols = 6
	args := make([]interface{}, 0, len(points)*cols)
	b.WriteString("INSERT INTO point (name, point_type_uuid, description, latitude, longitude, project_uuid) VALUES ")

	for i, p := range points {
		if i > 0 {
			b.WriteString(", ")
		}
		n := i * cols
		fmt.Fprintf(&b, "($%d, $%d, $%d, $%d, $%d, $%d)",
			n+1, n+2, n+3, n+4, n+5, n+6)

		var projectArg any
		if p.ProjectUUID != "" {
			projectArg = p.ProjectUUID
		}
		args = append(args, p.Name, p.Type, p.Description, p.Latitude, p.Longitude, projectArg)
	}

	tx, err := DB.Begin()
	if err != nil {
		return err
	}

	if _, err := tx.Exec(b.String(), args...); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

// queryPoints returns points, optionally filtered by project. Pass "" for all points.
func queryPoints(projectUUID string) ([]Point, error) {
	var (
		rows *sql.Rows
		err  error
	)
	if projectUUID != "" {
		rows, err = DB.Query(
			`SELECT id, uuid, name, point_type_uuid, description, latitude, longitude, project_uuid, created, updated
			 FROM point WHERE project_uuid = $1`,
			projectUUID,
		)
	} else {
		rows, err = DB.Query(
			`SELECT id, uuid, name, point_type_uuid, description, latitude, longitude, project_uuid, created, updated FROM point`,
		)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	points := []Point{}
	for rows.Next() {
		var p Point
		var name, ptype, description sql.NullString
		var projectUUIDVal sql.NullString
		if err := rows.Scan(&p.ID, &p.UUID, &name, &ptype, &description, &p.Latitude, &p.Longitude, &projectUUIDVal, &p.Created, &p.Updated); err != nil {
			return nil, err
		}
		p.Name = name.String
		p.Type = ptype.String
		p.Description = description.String
		p.ProjectUUID = projectUUIDVal.String
		points = append(points, p)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return points, nil
}

// updatePointByUUID updates a point and returns the number of rows affected.
func updatePointByUUID(uuid string, p Point) (int64, error) {
	res, err := DB.Exec(
		`UPDATE point
		 SET name = $1, point_type_uuid = $2, description = $3, latitude = $4, longitude = $5, updated = NOW()
		 WHERE uuid = $6`,
		p.Name, p.Type, p.Description, p.Latitude, p.Longitude, uuid,
	)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

// deletePointsByProject deletes all points belonging to a project. It runs
// within the caller's transaction, which owns commit/rollback.
func deletePointsByProject(tx *sql.Tx, projectUUID string) error {
	_, err := tx.Exec(`DELETE FROM point WHERE project_uuid = $1`, projectUUID)
	return err
}

// deletePointByUUID deletes a point and returns the number of rows affected.
func deletePointByUUID(uuid string) (int64, error) {
	res, err := DB.Exec(`DELETE FROM point WHERE uuid = $1`, uuid)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
