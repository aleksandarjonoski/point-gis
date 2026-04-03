package main

import (
	"bufio"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/lib/pq"
	"gopkg.in/yaml.v3"
)

type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
	SSLMode  string `yaml:"sslmode"`
}

type Config struct {
	Database DatabaseConfig `yaml:"database"`
}

var DB *sql.DB

func loadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("reading config file: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parsing config file: %w", err)
	}

	return &cfg, nil
}

func InitDB(configPath string) {
	cfg, err := loadConfig(configPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to PostgreSQL database")
}

func RunMigrations(initPath string, alterationsPath string) {
	// Run init.sql (uses IF NOT EXISTS, safe to re-run)
	initSQL, err := os.ReadFile(initPath)
	if err != nil {
		log.Fatalf("Failed to read init file: %v", err)
	}
	_, err = DB.Exec(string(initSQL))
	if err != nil {
		log.Fatalf("Failed to run init SQL: %v", err)
	}

	// Ensure migrations tracking table exists
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS migrations (
			id SERIAL PRIMARY KEY,
			tag TEXT NOT NULL UNIQUE,
			applied_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatalf("Failed to create migrations table: %v", err)
	}

	// Parse and run alterations
	alterations, err := parseMigrations(alterationsPath)
	if err != nil {
		log.Fatalf("Failed to parse alterations file: %v", err)
	}

	for _, m := range alterations {
		var exists bool
		err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM migrations WHERE tag = $1)", m.tag).Scan(&exists)
		if err != nil {
			log.Fatalf("Failed to check migration %s: %v", m.tag, err)
		}
		if exists {
			continue
		}

		_, err = DB.Exec(m.sql)
		if err != nil {
			log.Fatalf("Failed to run migration %s: %v", m.tag, err)
		}

		_, err = DB.Exec("INSERT INTO migrations (tag) VALUES ($1)", m.tag)
		if err != nil {
			log.Fatalf("Failed to record migration %s: %v", m.tag, err)
		}

		log.Printf("Applied migration: %s", m.tag)
	}

	log.Println("Database migrations applied")
}

type migration struct {
	tag string
	sql string
}

func parseMigrations(path string) ([]migration, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("opening alterations file: %w", err)
	}
	defer file.Close()

	var migrations []migration
	var currentTag string
	var currentSQL strings.Builder

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "-- @tag:") {
			if currentTag != "" {
				migrations = append(migrations, migration{tag: currentTag, sql: strings.TrimSpace(currentSQL.String())})
			}
			currentTag = strings.TrimSpace(strings.TrimPrefix(line, "-- @tag:"))
			currentSQL.Reset()
		} else {
			currentSQL.WriteString(line)
			currentSQL.WriteString("\n")
		}
	}
	if currentTag != "" {
		migrations = append(migrations, migration{tag: currentTag, sql: strings.TrimSpace(currentSQL.String())})
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("reading alterations file: %w", err)
	}

	return migrations, nil
}
