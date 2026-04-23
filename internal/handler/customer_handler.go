package handler

import (
	"net/http"
	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
)

type CustomerHandler struct {
	repo *repository.CustomerRepository
}

func NewCustomerHandler(repo *repository.CustomerRepository) *CustomerHandler {
	return &CustomerHandler{repo: repo}
}

// GetCustomers — GET /api/merchants/customers
func (h *CustomerHandler) GetCustomers(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	customers, err := h.repo.GetByMerchant(user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if customers == nil {
		customers = []model.Customer{} // Evita null no JSON
	}
	respondJSON(w, http.StatusOK, customers)
}
