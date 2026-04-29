package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gato-gateway/internal/dto"
	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/service"
)

type SubscriptionHandler struct {
	subService *service.SubscriptionService
}

func NewSubscriptionHandler(subService *service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{subService: subService}
}

func (h *SubscriptionHandler) Create(w http.ResponseWriter, r *http.Request) {
	userVal := r.Context().Value("user")
	if userVal == nil {
		http.Error(w, "Não autorizado", http.StatusUnauthorized)
		return
	}
	user := userVal.(model.UserContext)
	merchantID := user.MerchantID
	isSandbox := user.IsSandbox

	var req dto.CreateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Requisição inválida", http.StatusBadRequest)
		return
	}

	if req.IntervaloDias <= 0 {
		req.IntervaloDias = 30 // Padrão mensal
	}

	resp, _, err := h.subService.CreateSubscription(merchantID, req, isSandbox)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *SubscriptionHandler) List(w http.ResponseWriter, r *http.Request) {
	userVal := r.Context().Value("user")
	if userVal == nil {
		http.Error(w, "Não autorizado", http.StatusUnauthorized)
		return
	}
	user := userVal.(model.UserContext)
	merchantID := user.MerchantID

	subs, err := h.subService.ListSubscriptions(merchantID)
	if err != nil {
		http.Error(w, "Erro ao buscar assinaturas", http.StatusInternalServerError)
		return
	}

	if subs == nil {
		subs = []dto.SubscriptionResponse{} // garante array vazio no JSON em vez de null
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}
