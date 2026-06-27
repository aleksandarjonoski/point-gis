package main

import "database/sql"

// queryPointTypes returns the point types for a project, ordered by name.
func queryPointTypes(projectUUID string) ([]PointType, error) {
	rows, err := DB.Query(
		`SELECT id, uuid, name, description, project_uuid
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
		var name, description sql.NullString
		if err := rows.Scan(&pt.ID, &pt.UUID, &name, &description, &pt.ProjectUUID); err != nil {
			return nil, err
		}
		pt.Name = name.String
		pt.Description = description.String
		types = append(types, pt)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return types, nil
}

// insertPointType inserts a point type and returns its new UUID.
func insertPointType(pt PointType) (string, error) {
	var newUUID string
	err := DB.QueryRow(
		`INSERT INTO point_type (name, description, project_uuid)
		 VALUES ($1, $2, $3)
		 RETURNING uuid`,
		pt.Name, pt.Description, pt.ProjectUUID,
	).Scan(&newUUID)
	return newUUID, err
}
