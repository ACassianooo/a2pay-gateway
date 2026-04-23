package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
	"github.com/gato-gateway/internal/service"
)

// MerchantHandler gerencia API Keys, exclusão de conta (LGPD) e saques
type MerchantHandler struct {
	userRepo *repository.UserRepository
	walRepo  *repository.WalletRepository
	db       *sql.DB
	crypto   *service.CryptoService
}

func NewMerchantHandler(userRepo *repository.UserRepository, walRepo *repository.WalletRepository, db *sql.DB, crypto *service.CryptoService) *MerchantHandler {
	return &MerchantHandler{userRepo: userRepo, walRepo: walRepo, db: db, crypto: crypto}
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

// Withdraw — POST /api/merchants/withdraw
func (h *MerchantHandler) Withdraw(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	var req struct {
		Amount float64 `json:"amount"`
		PixKey string  `json:"pix_key"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	if req.Amount <= 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Valor deve ser maior que zero"})
		return
	}

	// 1. Iniciar transação para garantir débito e criação de registro atômicos
	tx, err := h.db.Begin()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro interno ao iniciar transação"})
		return
	}
	defer tx.Rollback()

	// 2. Debitar da wallet (já valida saldo e faz lock FOR UPDATE)
	if err := h.walRepo.DebitWallet(tx, user.MerchantID, req.Amount, "withdraw_request", "Saque solicitado via Dashboard"); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// 3. Criar registro de saque
	withdrawID, err := h.walRepo.CreateWithdrawal(user.MerchantID, req.Amount, req.PixKey)
	if err != nil {
		log.Printf("[WITHDRAW] Erro ao criar registro de saque: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao salvar solicitação"})
		return
	}

	// 4. Commit
	if err := tx.Commit(); err != nil {
		log.Printf("[WITHDRAW] Erro ao commitar saque: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao finalizar saque"})
		return
	}

	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"id":      withdrawID,
		"message": "Saque solicitado com sucesso. O valor foi reservado.",
	})
}

// GetWithdrawals — GET /api/merchants/withdrawals
func (h *MerchantHandler) GetWithdrawals(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	list, err := h.walRepo.GetWithdrawals(user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if list == nil {
		list = []model.Withdrawal{}
	}
	respondJSON(w, http.StatusOK, list)
}
