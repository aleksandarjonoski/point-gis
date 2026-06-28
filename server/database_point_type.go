package main

import "database/sql"

// queryPointTypes returns the point types for a project, ordered by name.
func queryPointTypes(projectUUID string) ([]PointType, error) {
	rows, err := DB.Query(
		`SELECT id, uuid, name, description, icon, color, project_uuid
		 FROM point_type
		 WHERE project_uuid = $1
		 ORDER BY name`,
		projectUUID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	types := []PointType{}
	for rows.Next() {
		var pt PointType
		var name, description, icon, color sql.NullString
		if err := rows.Scan(&pt.ID, &pt.UUID, &name, &description, &icon, &color, &pt.ProjectUUID); err != nil {
			return nil, err
		}
		pt.Name = name.String
		pt.Description = description.String
		pt.Icon = icon.String
		pt.Color = color.String
		types = append(types, pt)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return types, nil
}

// updatePointTypeByUUID updates a point type's editable fields and returns the
// number of rows affected.
func updatePointTypeByUUID(uuid string, pt PointType) (int64, error) {
	res, err := DB.Exec(
		`UPDATE point_type
		 SET name = $1, description = $2, icon = $3, color = $4
		 WHERE uuid = $5`,
		pt.Name, pt.Description, pt.Icon, pt.Color, uuid,
	)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

// deletePointTypesByProject deletes all point types belonging to a project. It
// runs within the caller's transaction, which owns commit/rollback.
func deletePointTypesByProject(tx *sql.Tx, projectUUID string) error {
	_, err := tx.Exec(`DELETE FROM point_type WHERE project_uuid = $1`, projectUUID)
	return err
}

// insertPointType inserts a point type and returns its new UUID.
func insertPointType(pt PointType) (string, error) {
	var newUUID string
	err := DB.QueryRow(
		`INSERT INTO point_type (name, description, icon, color, project_uuid)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING uuid`,
		pt.Name, pt.Description, pt.Icon, pt.Color, pt.ProjectUUID,
	).Scan(&newUUID)
	return newUUID, err
}
