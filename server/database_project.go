package main

import "database/sql"

// queryProjects returns projects visible to the given user: all public projects
// plus the user's own. Pass "" to return only public projects.
func queryProjects(userUUID string) ([]Project, error) {
	var userArg any = nil
	if userUUID != "" {
		userArg = userUUID
	}

	rows, err := DB.Query(
		`SELECT id, uuid, name, description, user_uuid, is_public
		 FROM project
		 WHERE is_public = TRUE OR user_uuid = $1`,
		userArg,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		var p Project
		var description sql.NullString
		if err := rows.Scan(&p.ID, &p.UUID, &p.Name, &description, &p.UserUUID, &p.IsPublic); err != nil {
			return nil, err
		}
		p.Description = description.String
		projects = append(projects, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

// insertProject inserts a project owned by userUUID and returns its new UUID.
func insertProject(p Project, userUUID string) (string, error) {
	var newUUID string
	err := DB.QueryRow(
		`INSERT INTO project (name, description, user_uuid, is_public)
		 VALUES ($1, $2, $3, $4)
		 RETURNING uuid`,
		p.Name, p.Description, userUUID, p.IsPublic,
	).Scan(&newUUID)
	return newUUID, err
}
