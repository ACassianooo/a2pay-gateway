package handler

import (
	"net/http"

	"github.com/gato-gateway/internal/database"
	"github.com/gato-gateway/internal/dto"
)

// HealthHandler expõe um endpoint de saúde para monitoramento e load balancers
type HealthHandler struct {
	db *database.DB
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// Check — GET /health
func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	dbStatus := "ok"
	if err := h.db.Ping(); err != nil {
		dbStatus = "error: " + err.Error()
	}

	status := "ok"
	code := http.StatusOK
	if dbStatus != "ok" {
		status = "degraded"
		code = http.StatusServiceUnavailable
	}

	respondJSON(w, code, dto.HealthResponse{
		Status:  status,
		Version: "1.0.0",
		DB:      dbStatus,
	})
}
