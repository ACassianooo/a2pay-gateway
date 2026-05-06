package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
	"github.com/go-chi/chi/v5"
)

type DisputeHandler struct {
	repo *repository.DisputeRepository
}

func NewDisputeHandler(repo *repository.DisputeRepository) *DisputeHandler {
	return &DisputeHandler{repo: repo}
}

func (h *DisputeHandler) GetDisputes(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	disputes, err := h.repo.List(user.MerchantID, user.IsSandbox)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	// Mock: Se for sandbox e não houver disputas, cria duas para teste
	if user.IsSandbox && len(disputes) == 0 {
		deadline := time.Now().AddDate(0, 0, 7)
		h.repo.CreateMock(model.Dispute{
			TransactionID:    1,
			MerchantID:       user.MerchantID,
			Amount:           150.00,
			Reason:           "Produto não recebido",
			Status:           "aberta",
			EvidenceDeadline: &deadline,
			IsTest:           true,
		})
		h.repo.CreateMock(model.Dispute{
			TransactionID: 2,
			MerchantID:    user.MerchantID,
			Amount:        299.90,
			Reason:        "Transação não reconhecida",
			Status:        "ganha",
			IsTest:        true,
		})
		disputes, _ = h.repo.List(user.MerchantID, user.IsSandbox)
	}

	if disputes == nil {
		disputes = []model.Dispute{}
	}
	respondJSON(w, http.StatusOK, disputes)
}

func (h *DisputeHandler) GetDisputeDetails(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.Atoi(idStr)

	dispute, err := h.repo.GetByID(id, user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Disputa não encontrada"})
		return
	}
	respondJSON(w, http.StatusOK, dispute)
}

func (h *DisputeHandler) DefendDispute(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.Atoi(idStr)

	// Simulação: Apenas atualiza o status para 'em_revisao'
	if err := h.repo.UpdateStatus(id, user.MerchantID, "em_revisao"); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao enviar defesa"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Defesa enviada com sucesso! A disputa está em revisão."})
}
