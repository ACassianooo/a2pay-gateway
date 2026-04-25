package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://postgres.wozbuvbhmtkgexayznnq:VK210EAPqOlT2PAT@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"
	}
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	query := `
	CREATE TABLE IF NOT EXISTS products (
		id SERIAL PRIMARY KEY,
		merchant_id INT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
		name VARCHAR(255) NOT NULL,
		description TEXT,
		price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
		cycle VARCHAR(50) DEFAULT 'uma_vez',
		image_url TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(merchant_id, name)
	);
	`
	_, err = db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create products table:", err)
	}

	fmt.Println("Products table created successfully!")
}
