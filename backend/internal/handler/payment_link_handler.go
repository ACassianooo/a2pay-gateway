package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"math/rand"

	"github.com/go-chi/chi/v5"
	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
)

type PaymentLinkHandler struct {
	repo *repository.PaymentLinkRepository
}

func NewPaymentLinkHandler(repo *repository.PaymentLinkRepository) *PaymentLinkHandler {
	return &PaymentLinkHandler{repo: repo}
}

func (h *PaymentLinkHandler) Create(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(model.UserContext)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var req struct {
		Name   string   `json:"name"`
		Amount *float64 `json:"amount"` // Optional
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		return
	}

	if req.Name == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Name is required"})
		return
	}

	// Gerar URL do link (Ex: checkout customizado na plataforma)
	hash := fmt.Sprintf("%x", rand.Int63())[:8]
	url := fmt.Sprintf("https://a2pay.com.br/pay/%d-%s", user.MerchantID, hash)

	id, err := h.repo.Create(user.MerchantID, req.Name, req.Amount, url)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create payment link"})
		return
	}

	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Link criado com sucesso",
		"id":      id,
		"url":     url,
	})
}

func (h *PaymentLinkHandler) List(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(model.UserContext)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	links, err := h.repo.ListByMerchant(user.MerchantID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to list links"})
		return
	}

	respondJSON(w, http.StatusOK, links)
}

func (h *PaymentLinkHandler) GetByHash(w http.ResponseWriter, r *http.Request) {
	hashStr := chi.URLParam(r, "id") // Expected format: {merchantID}-{hash}
	
	fullURL := "https://a2pay.com.br/pay/" + hashStr

	link, err := h.repo.GetByURL(fullURL)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Payment link not found"})
		return
	}

	// We inject the merchantID manually so the UI knows where to send the payment Intent.
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"id": link.ID,
		"name": link.Name,
		"amount": link.Amount,
		"merchant_id": link.MerchantID,
	})
}
