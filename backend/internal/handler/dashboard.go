package handler

import (
	"net/http"

	"github.com/gato-gateway/internal/repository"
)

// DashboardHandler entrega dados de leitura para o frontend
type DashboardHandler struct {
	userRepo *repository.UserRepository
	txRepo   *repository.TransactionRepository
	walRepo  *repository.WalletRepository
}

func NewDashboardHandler(userRepo *repository.UserRepository, txRepo *repository.TransactionRepository, walRepo *repository.WalletRepository) *DashboardHandler {
	return &DashboardHandler{userRepo: userRepo, txRepo: txRepo, walRepo: walRepo}
}

// Dashboard — GET /api/pagamentos
func (h *DashboardHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	isTest := r.Header.Get("x-a2pay-env") == "test"

	if user.Role == "master" || user.Role == "admin" {
		lucro, empresas, err := h.userRepo.GetMasterStats()
		if err != nil {
			respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		name, _ := h.userRepo.GetName(user.MerchantID)
		respondJSON(w, http.StatusOK, map[string]interface{}{
			"role":        user.Role,
			"name":        name,
			"lucro_total": lucro,
			"empresas":    empresas,
			"is_sandbox":  isTest,
		})
		return
	}

	txs, _, err := h.txRepo.GetByMerchant(user.MerchantID, isTest)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	// Saldo real vindo da wallet protegida
	saldo, _ := h.walRepo.GetBalance(user.MerchantID, isTest)
	name, _ := h.userRepo.GetName(user.MerchantID)

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"role":          user.Role,
		"name":          name,
		"saldo_lojista": saldo,
		"transacoes":    txs,
		"is_sandbox":    isTest,
	})
}
