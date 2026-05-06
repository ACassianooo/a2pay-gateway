package main

import (
	"log"
	"math/rand"
	"time"

	"github.com/gato-gateway/internal/config"
	"github.com/gato-gateway/internal/database"
	"github.com/gato-gateway/internal/server"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("[FATAL] Config: %v", err)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[FATAL] Database connection failed: %v", err)
	}
	defer db.Close()

	srv := server.New(cfg, db)
	addr := ":" + cfg.Port
	if err := srv.Start(addr); err != nil {
		log.Fatalf("[FATAL] Server: %v", err)
	}
}
