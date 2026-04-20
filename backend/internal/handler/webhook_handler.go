package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gato-gateway/internal/repository"
)

// WebhookHandler recebe eventos assíncronos do Asaas
// O Asaas envia uma requisição POST quando o status de um pagamento muda
type WebhookHandler struct {
	txRepo *repository.TransactionRepository
	secret string // ASAAS_WEBHOOK_SECRET para validar autenticidade
}

func NewWebhookHandler(txRepo *repository.TransactionRepository, secret string) *WebhookHandler {
	return &WebhookHandler{txRepo: txRepo, secret: secret}
}

// AsaasEvent é o payload enviado pelo Asaas via webhook
type AsaasEvent struct {
	Event   string `json:"event"`
	Payment struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	} `json:"payment"`
}

// Handle — POST /webhooks/asaas
// Confirma automaticamente pagamentos PIX quando o Asaas notifica "PAYMENT_RECEIVED"
func (h *WebhookHandler) Handle(w http.ResponseWriter, r *http.Request) {
	// Validar token de segurança do webhook
	if h.secret != "" {
		token := r.Header.Get("asaas-access-token")
		if token != h.secret {
			log.Printf("[WEBHOOK] Token inválido: %s", token)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
	}

	var event AsaasEvent
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "payload inválido", http.StatusBadRequest)
		return
	}

	log.Printf("[WEBHOOK] Evento recebido: %s | charge: %s", event.Event, event.Payment.ID)

	switch event.Event {
	case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED":
		if err := h.txRepo.ConfirmPIX(event.Payment.ID); err != nil {
			log.Printf("[WEBHOOK] Erro ao confirmar PIX %s: %v", event.Payment.ID, err)
			http.Error(w, "erro interno", http.StatusInternalServerError)
			return
		}
		log.Printf("[WEBHOOK] ✅ PIX confirmado: %s", event.Payment.ID)

	case "TRANSFER_CONFIRMATION":
		// Este é o evento de "Validação de Saque" que você vê no seu print.
		// Retornar 200 OK aqui diz ao Asaas: "Sim, eu autorizo este saque".
		log.Printf("[WEBHOOK] 💸 Solicitação de saque recebida e APROVADA.")

	default:
		log.Printf("[WEBHOOK] Evento ignorado: %s", event.Event)
	}

	// Asaas espera 200 OK para não reenviar o evento
	w.WriteHeader(http.StatusOK)
}
