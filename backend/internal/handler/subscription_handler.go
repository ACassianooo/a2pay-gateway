package handler

import (
	"encoding/json"
	"fmt"
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
	w.Header().Set("Content-Type", "application/json")
	
	// Recuperar de panics e retornar JSON
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("[PANIC] %v\n", r)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Panic interno: %v", r)})
		}
	}()

	userVal := r.Context().Value("user")
	if userVal == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Não autorizado"})
		return
	}
	user := userVal.(model.UserContext)
	merchantID := user.MerchantID
	
	// Prioriza o header (dashboard) ou usa o claim do token (API Key)
	isSandbox := r.Header.Get("x-a2pay-env") == "test"
	if !isSandbox && user.IsSandbox {
		isSandbox = true
	}

	fmt.Printf("[DEBUG] Criando assinatura: Merchant=%d Sandbox=%v\n", merchantID, isSandbox)

	var req dto.CreateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Requisição inválida"})
		return
	}

	if req.IntervaloDias <= 0 {
		req.IntervaloDias = 30 // Padrão mensal
	}

	resp, _, err := h.subService.CreateSubscription(merchantID, req, isSandbox)
	if err != nil {
		fmt.Printf("[Subscription Error] Merchant=%d Error=%v\n", merchantID, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Erro interno: " + err.Error()})
		return
	}

	if resp == nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Resposta do serviço está vazia"})
		return
	}

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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Erro ao buscar assinaturas"})
		return
	}

	if subs == nil {
		subs = []dto.SubscriptionResponse{} // garante array vazio no JSON em vez de null
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}
