package handler

import (
	"encoding/json"
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
// GetWithdrawals retorna todos os saques solicitados no sistema
func (h *AdminHandler) GetWithdrawals(w http.ResponseWriter, r *http.Request) {
	list, err := h.adminRepo.GetAllWithdrawals()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if list == nil {
		list = []repository.GlobalWithdrawalRow{}
	}
	respondJSON(w, http.StatusOK, list)
}

// ApproveWithdrawal aprova ou rejeita um saque
func (h *AdminHandler) ApproveWithdrawal(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID     int    `json:"id"`
		Status string `json:"status"` // "pago" ou "rejeitado"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	if req.Status != "pago" && req.Status != "rejeitado" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Status inválido"})
		return
	}

	err := h.adminRepo.UpdateWithdrawalStatus(req.ID, req.Status)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Saque atualizado com sucesso"})
}
