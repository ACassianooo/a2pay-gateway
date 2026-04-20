// Package database gerencia a conexão com o banco e o sistema de migrations.
// Usa embed para empacotar os arquivos .sql dentro do binário compilado,
// garantindo que funcionem mesmo após o deploy (sem depender de arquivos externos).
package database

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"sort"

	_ "github.com/lib/pq"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// DB encapsula a conexão com o banco de dados
type DB struct {
	Conn *sql.DB
}

// Connect abre a conexão e executa todas as migrations pendentes
func Connect(dsn string) (*DB, error) {
	// DSN para Postgres: "postgres://user:pass@host:port/dbname?sslmode=disable"
	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("erro ao abrir banco: %w", err)
	}
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("banco inacessível: %w", err)
	}

	d := &DB{Conn: conn}
	if err := d.runMigrations(); err != nil {
		return nil, fmt.Errorf("erro ao executar migrations: %w", err)
	}

	return d, nil
}

// runMigrations cria a tabela de controle e aplica migrations não aplicadas
func (d *DB) runMigrations() error {
	// Tabela de controle de migrations
	_, err := d.Conn.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version    INTEGER PRIMARY KEY,
		name       TEXT NOT NULL,
		applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		return err
	}

	// Ler arquivos de migration embarcados
	entries, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return err
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Name() < entries[j].Name()
	})

	for idx, entry := range entries {
		version := idx + 1
		name := entry.Name()

		// Verificar se já foi aplicada
		var count int
		d.Conn.QueryRow("SELECT COUNT(*) FROM schema_migrations WHERE version = $1", version).Scan(&count)
		if count > 0 {
			continue
		}

		// Ler e executar o SQL
		data, err := migrationsFS.ReadFile("migrations/" + name)
		if err != nil {
			return fmt.Errorf("erro ao ler migration %s: %w", name, err)
		}

		// O driver lib/pq suporta multiplos statements no Exec.
		if _, err := d.Conn.Exec(string(data)); err != nil {
			return fmt.Errorf("erro ao executar migration %s: %w", name, err)
		}

		// Registrar como aplicada
		d.Conn.Exec("INSERT INTO schema_migrations(version, name) VALUES($1, $2)", version, name)
		log.Printf("[DB] Migration aplicada: %s", name)
	}

	return nil
}

// Close fecha a conexão com o banco
func (d *DB) Close() error {
	return d.Conn.Close()
}

// Ping verifica se o banco está disponível (usado no health check)
func (d *DB) Ping() error {
	return d.Conn.Ping()
}
