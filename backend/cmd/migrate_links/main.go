package main

import (
	"log"

	"github.com/gato-gateway/internal/config"
	"github.com/gato-gateway/internal/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Conn.Exec(`
	CREATE TABLE IF NOT EXISTS payment_links (
		id SERIAL PRIMARY KEY,
		merchant_id INT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
		name VARCHAR(255) NOT NULL,
		amount NUMERIC(10, 2),
		status VARCHAR(50) DEFAULT 'active',
		url VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Migration successful!")
}
