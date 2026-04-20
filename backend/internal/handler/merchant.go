package handler

import (
	"net/http"
	"time"
	"encoding/json"

	"github.com/gato-gateway/internal/dto"
	"github.com/gato-gateway/internal/repository"
	"github.com/gato-gateway/internal/service"
)

// MerchantHandler gerencia API Keys e exclusão de conta (LGPD)
type MerchantHandler struct {
	userRepo *repository.UserRepository
	txRepo   *repository.TransactionRepository
	crypto   *service.CryptoService
}

func NewMerchantHandler(userRepo *repository.UserRepository, crypto *service.CryptoService) *MerchantHandler {
	return &MerchantHandler{userRepo: userRepo, crypto: crypto}
}

// GetAPIKey — GET /api/merchants/apikey
func (h *MerchantHandler) GetAPIKey(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	if user.Role == "master" {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "Master não possui API Key"})
		return
	}
	key, caps, err := h.userRepo.GetAPIKey(user.MerchantID)
	if err != nil || key == "" {
		key = service.GenerateAPIKey()
		caps = "pix,card" // Default 
		h.userRepo.SetAPIKey(user.MerchantID, key, caps)
	}
	respondJSON(w, http.StatusOK, dto.APIKeyResponse{
		APIKey:       key,
		Capabilities: caps,
		CreatedAt:    time.Now().Format("02/01/2006"),
		Endpoint:     "http://localhost:8080/api/v1/pix",
	})
}

// RotateAPIKey — POST /api/merchants/apikey/rotate
func (h *MerchantHandler) RotateAPIKey(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	if user.Role == "master" {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "Master não possui API Key"})
		return
	}
	
	// Read requested capabilities
	var req struct {
		Capabilities string `json:"capabilities"`
	}
	// Ignoramos o erro pois se não vier JSON, usaremos o default
	if r.Body != nil {
		json.NewDecoder(r.Body).Decode(&req)
	}
	
	if req.Capabilities != "pix" && req.Capabilities != "pix,card" && req.Capabilities != "card" {
		req.Capabilities = "pix,card" // Default se enviar bobeira
	}

	nova := service.GenerateAPIKey()
	if err := h.userRepo.SetAPIKey(user.MerchantID, nova, req.Capabilities); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao rotacionar chave"})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{
		"api_key": nova,
		"capabilities": req.Capabilities,
		"message": "Nova API Key gerada. Atualize suas integrações.",
	})
}

// DeleteAccount — DELETE /api/merchants/account (LGPD Art. 18)
func (h *MerchantHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	if user.Role == "master" {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "Conta master não pode ser excluída aqui"})
		return
	}
	// Deleta transações e depois o merchant
	h.userRepo.Delete(user.MerchantID)
	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Conta e dados removidos permanentemente (LGPD Art. 18).",
	})
}
