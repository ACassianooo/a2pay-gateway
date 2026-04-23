package handler

import (
	"net/http"

	"github.com/gato-gateway/internal/repository"
)

// AdminHandler lida com as rotas exclusivas do painel master
type AdminHandler struct {
	adminRepo *repository.AdminRepository
}

func NewAdminHandler(adminRepo *repository.AdminRepository) *AdminHandler {
	return &AdminHandler{adminRepo: adminRepo}
}

// GetUsers retorna a listagem completa de usuários/lojistas e seus volumes processados
func (h *AdminHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.adminRepo.GetAllUsers()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	
	// mock fallback for no results
	if users == nil {
		users = []repository.UserRow{}
	}

	respondJSON(w, http.StatusOK, users)
}

// GetGlobalTransactions retorna transações de todos os lojistas do ecossistema
func (h *AdminHandler) GetGlobalTransactions(w http.ResponseWriter, r *http.Request) {
	txs, err := h.adminRepo.GetGlobalTransactions()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	if txs == nil {
		txs = []repository.GlobalTransactionRow{}
	}

	respondJSON(w, http.StatusOK, txs)
}

// GetFraudAlerts retorna a lista de transações com risco (recusadas, fraude, etc)
func (h *AdminHandler) GetFraudAlerts(w http.ResponseWriter, r *http.Request) {
	txs, err := h.adminRepo.GetRiskTransactions()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	if txs == nil {
		txs = []repository.GlobalTransactionRow{}
	}

	respondJSON(w, http.StatusOK, txs)
}
