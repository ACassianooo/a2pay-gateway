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
		cfg, err := config.Load()
		if err != nil {
			http.Error(w, "Erro ao carregar config: "+err.Error(), http.StatusInternalServerError)
			return
		}
		
		db, err := database.Connect(cfg.DatabaseURL)
		if err != nil {
			http.Error(w, "Erro ao conectar no banco: "+err.Error(), http.StatusInternalServerError)
			return
		}
		
		srvInstance = server.New(cfg, db)
	}
	
	srvInstance.Handler().ServeHTTP(w, r)
}
