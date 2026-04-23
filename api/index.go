package handler

import (
	"net/http"
	"github.com/gato-gateway/internal/config"
	"github.com/gato-gateway/internal/database"
	"github.com/gato-gateway/internal/server"
)

var srvInstance *server.Server

func Handler(w http.ResponseWriter, r *http.Request) {
	if srvInstance == nil {
		cfg, _ := config.Load()
		db, _ := database.Connect(cfg.DatabaseURL)
		srvInstance = server.New(cfg, db)
	}
	
	srvInstance.Handler().ServeHTTP(w, r)
}
