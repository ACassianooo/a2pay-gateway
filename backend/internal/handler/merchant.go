package handler

import (
	"net/http"
	"encoding/json"

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
	live, test, caps, err := h.userRepo.GetAPIKey(user.MerchantID)
	if err != nil || live == "" {
		live = service.GenerateAPIKey("a2p_live_")
		test = service.GenerateAPIKey("a2p_test_")
		caps = "pix,card"
		h.userRepo.SetAPIKeys(user.MerchantID, live, test, caps)
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"api_key":      live,
		"api_key_test": test,
		"capabilities": caps,
		"endpoint":     "http://localhost:8080/api/v1/pix",
	})
}

// RotateAPIKey — POST /api/merchants/apikey/rotate
func (h *MerchantHandler) RotateAPIKey(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	if user.Role == "master" {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "Master não possui API Key"})
		return
	}

	var req struct {
		Capabilities string `json:"capabilities"`
		Environment  string `json:"environment"` // "live" ou "test"
	}
	if r.Body != nil {
		json.NewDecoder(r.Body).Decode(&req)
	}

	if req.Capabilities == "" {
		req.Capabilities = "pix,card"
	}

	live, test, _, _ := h.userRepo.GetAPIKey(user.MerchantID)

	if req.Environment == "test" {
		test = service.GenerateAPIKey("a2p_test_")
	} else {
		live = service.GenerateAPIKey("a2p_live_")
	}

	if err := h.userRepo.SetAPIKeys(user.MerchantID, live, test, req.Capabilities); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao rotacionar chave"})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{
		"api_key":      live,
		"api_key_test": test,
		"capabilities": req.Capabilities,
		"message":      "API Key atualizada com sucesso.",
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
