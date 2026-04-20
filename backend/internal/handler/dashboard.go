package handler

import (
	"net/http"

	"github.com/gato-gateway/internal/repository"
)

// DashboardHandler entrega dados de leitura para o frontend
type DashboardHandler struct {
	userRepo *repository.UserRepository
	txRepo   *repository.TransactionRepository
}

func NewDashboardHandler(userRepo *repository.UserRepository, txRepo *repository.TransactionRepository) *DashboardHandler {
	return &DashboardHandler{userRepo: userRepo, txRepo: txRepo}
}

// Dashboard — GET /api/pagamentos
func (h *DashboardHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)

	if user.Role == "master" {
		lucro, empresas, err := h.userRepo.GetMasterStats()
		if err != nil {
			respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusOK, map[string]interface{}{
			"role":        "master",
			"lucro_total": lucro,
			"empresas":    empresas,
		})
		return
	}

	txs, saldo, err := h.txRepo.GetByMerchant(user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"role":          "lojista",
		"saldo_lojista": saldo,
		"transacoes":    txs,
	})
}
