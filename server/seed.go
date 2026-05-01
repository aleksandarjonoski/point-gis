package main

import (
	"database/sql"
	"errors"
	"log"
)

func SeedSampleData() {
	const (
		sampleUserName  = "Sample User"
		sampleUserEmail = "sample@example.com"
		sampleProject   = "General"
	)

	tx, err := DB.Begin()
	if err != nil {
		log.Fatalf("Seed: begin tx: %v", err)
	}
	defer tx.Rollback()

	var userUUID string
	err = tx.QueryRow(
		`INSERT INTO users (name, user_email) VALUES ($1, $2)
		 ON CONFLICT (user_email) DO UPDATE SET name = EXCLUDED.name
		 RETURNING uuid`,
		sampleUserName, sampleUserEmail,
	).Scan(&userUUID)
	if err != nil {
		log.Fatalf("Seed: upsert user: %v", err)
	}

	var projectUUID string
	err = tx.QueryRow(
		`SELECT uuid FROM project WHERE name = $1 AND user_uuid = $2`,
		sampleProject, userUUID,
	).Scan(&projectUUID)
	if errors.Is(err, sql.ErrNoRows) {
		err = tx.QueryRow(
			`INSERT INTO project (name, description, user_uuid, is_public) VALUES ($1, $2, $3, TRUE) RETURNING uuid`,
			sampleProject, "Default shared project visible to every user", userUUID,
		).Scan(&projectUUID)
		if err != nil {
			log.Fatalf("Seed: insert project: %v", err)
		}
	} else if err != nil {
		log.Fatalf("Seed: lookup project: %v", err)
	} else {
		if _, err := tx.Exec(`UPDATE project SET is_public = TRUE WHERE uuid = $1`, projectUUID); err != nil {
			log.Fatalf("Seed: mark project public: %v", err)
		}
	}

	var pointCount int
	if err := tx.QueryRow(
		`SELECT COUNT(*) FROM point WHERE project_uuid = $1`, projectUUID,
	).Scan(&pointCount); err != nil {
		log.Fatalf("Seed: count points: %v", err)
	}

	if pointCount == 0 {
		samplePoints := []struct {
			pType, desc    string
			lat, lng       float64
		}{
			{"landmark", "Skopje city center", 41.9981, 21.4254},
			{"landmark", "Ohrid lakeside", 41.1172, 20.8019},
			{"landmark", "Bitola clock tower", 41.0314, 21.3347},
		}
		for _, p := range samplePoints {
			if _, err := tx.Exec(
				`INSERT INTO point (type, description, latitude, longitude, project_uuid)
				 VALUES ($1, $2, $3, $4, $5)`,
				p.pType, p.desc, p.lat, p.lng, projectUUID,
			); err != nil {
				log.Fatalf("Seed: insert point: %v", err)
			}
		}
		log.Printf("Seeded %d sample points into project %q", len(samplePoints), sampleProject)
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Seed: commit: %v", err)
	}

	log.Println("Sample data ready")
}
