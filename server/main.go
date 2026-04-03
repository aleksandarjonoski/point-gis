package main

func main() {
	InitDB("data/config/dev.yml")
	defer DB.Close()

	RunMigrations("data/sql/init.sql", "data/sql/alterations.sql")

	runHttp()
}
