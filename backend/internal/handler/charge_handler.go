package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
)

type ChargeHandler struct {
	repo *repository.ChargeRepository
}

func NewChargeHandler(repo *repository.ChargeRepository) *ChargeHandler {
	return &ChargeHandler{repo: repo}
}

func (h *ChargeHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(model.UserContext)

	var req struct {
		CustomerEmail string  `json:"customer_email"`
		Amount        float64 `json:"amount"`
		DueDate       string  `json:"due_date"`
		Description   string  `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid payload"})
		return
	}

	_, err := h.repo.Create(user.MerchantID, req.CustomerEmail, req.Amount, req.DueDate, req.Description)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create charge"})
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"message": "Cobrança gerada com sucesso!"})
}

func (h *ChargeHandler) List(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(model.UserContext)

	charges, err := h.repo.GetByMerchant(user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch charges"})
		return
	}

	if charges == nil {
		charges = []model.Charge{}
	}

	respondJSON(w, http.StatusOK, charges)
}
