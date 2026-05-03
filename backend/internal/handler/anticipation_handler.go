package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
)

type AnticipationHandler struct {
	repo       *repository.AnticipationRepository
	walletRepo *repository.WalletRepository
}

func NewAnticipationHandler(repo *repository.AnticipationRepository, walletRepo *repository.WalletRepository) *AnticipationHandler {
	return &AnticipationHandler{repo: repo, walletRepo: walletRepo}
}

func (h *AnticipationHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(model.UserContext)

	var req struct {
		Amount float64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid payload"})
		return
	}

	if req.Amount <= 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Amount must be positive"})
		return
	}

	// Simulação: taxa de 2.99%
	fee := req.Amount * 0.0299
	net := req.Amount - fee

	_, err := h.repo.Create(user.MerchantID, req.Amount, fee, net)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create anticipation"})
		return
	}

	// Em um ambiente real, você também chamaria o walletRepo para ajustar os saldos bloqueado -> disponível

	respondJSON(w, http.StatusCreated, map[string]string{"message": "Antecipação solicitada com sucesso!"})
}

func (h *AnticipationHandler) List(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(model.UserContext)

	ants, err := h.repo.GetByMerchant(user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch anticipations"})
		return
	}

	if ants == nil {
		ants = []model.Anticipation{}
	}

	respondJSON(w, http.StatusOK, ants)
}
