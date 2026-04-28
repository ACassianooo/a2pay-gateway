package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

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

// PostCreateCustomer — POST /api/merchants/customers
func (h *CustomerHandler) PostCreateCustomer(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	var c model.Customer
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	c.MerchantID = user.MerchantID
	if c.ID == "" {
		c.ID = fmt.Sprintf("AC_%d", time.Now().UnixNano())
	}

	if err := h.repo.Create(c); err != nil {
		log.Printf("[CustomerHandler] Erro ao criar cliente: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("Erro no banco: %v", err)})
		return
	}

	respondJSON(w, http.StatusCreated, c)
}
