package migration

import (
	"database/sql"
	"embed"

	"github.com/pressly/goose/v3"
)

//go:embed schema/*.sql
var embedMigrations embed.FS

func Up(db *sql.DB) error {
	goose.SetBaseFS(embedMigrations)
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}
	if err := goose.Up(db, "schema"); err != nil {
		return err
	}
	return nil
}

func Down(db *sql.DB) error {
	goose.SetBaseFS(embedMigrations)
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}
	if err := goose.Down(db, "schema"); err != nil {
		return err
	}
	return nil
}

func Status(db *sql.DB) error {
	goose.SetBaseFS(embedMigrations)
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}
	if err := goose.Status(db, "schema"); err != nil {
		return err
	}
	return nil
}
