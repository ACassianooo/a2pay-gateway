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
	customers, err := h.repo.GetByMerchant(user.MerchantID, user.IsSandbox)
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
	c.IsTest = user.IsSandbox
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

// Update — PUT /api/merchants/customers
func (h *CustomerHandler) Update(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	var c model.Customer
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	if err := h.repo.Update(c.ID, user.MerchantID, c.Name, c.Email, c.CPF, c.Phone); err != nil {
		log.Printf("[CustomerHandler] Erro ao atualizar cliente: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao atualizar cliente"})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Cliente atualizado com sucesso"})
}

// Delete — DELETE /api/merchants/customers/{id}
func (h *CustomerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	id := chi.URLParam(r, "id")
	if id == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "ID ausente"})
		return
	}

	if err := h.repo.Delete(id, user.MerchantID); err != nil {
		log.Printf("[CustomerHandler] Erro ao deletar cliente: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro ao deletar cliente"})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Cliente excluído com sucesso"})
}
