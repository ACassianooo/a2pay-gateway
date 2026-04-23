package handler

import (
	"net/http"
	"github.com/gato-gateway/internal/config"
	"github.com/gato-gateway/internal/database"
	"github.com/gato-gateway/internal/server"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	cfg, _ := config.Load()
	db, _ := database.Connect(cfg.DatabaseURL)
	srv := server.New(cfg, db)
	
	// Repassa a requisição para o roteador do seu servidor
	srv.Handler().ServeHTTP(w, r)
}
