package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gato-gateway/internal/model"
	apierrors "github.com/gato-gateway/internal/errors"
)

// GetUserFromContext extrai o UserContext injetado pelo middleware de autenticação
func GetUserFromContext(r *http.Request) model.UserContext {
	return r.Context().Value("user").(model.UserContext)
}

// respondJSON serializa o payload como JSON e define o status HTTP
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

// respondErr converte um AppError em resposta HTTP com status correto
func respondErr(w http.ResponseWriter, err *apierrors.AppError) {
	status := http.StatusInternalServerError
	switch err.Code {
	case "NOT_FOUND":
		status = http.StatusNotFound
	case "UNAUTHORIZED":
		status = http.StatusUnauthorized
	case "FORBIDDEN":
		status = http.StatusForbidden
	case "INVALID_INPUT":
		status = http.StatusBadRequest
	case "EXTERNAL_SERVICE":
		status = http.StatusBadGateway
	}
	respondJSON(w, status, map[string]string{
		"error": err.Message,
		"code":  err.Code,
	})
}
