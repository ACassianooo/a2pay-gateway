package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"io"
	"net/http"

	"github.com/gato-gateway/internal/repository"
)

// WebhookHandler recebe eventos assíncronos do Asaas
type WebhookHandler struct {
	txRepo  *repository.TransactionRepository
	walRepo *repository.WalletRepository
	db      *sql.DB
	secret  string // ASAAS_WEBHOOK_SECRET para validar autenticidade
}

func NewWebhookHandler(txRepo *repository.TransactionRepository, walRepo *repository.WalletRepository, db *sql.DB, secret string) *WebhookHandler {
	return &WebhookHandler{
		txRepo:  txRepo,
		walRepo: walRepo,
		db:      db,
		secret:  secret,
	}
}

// AsaasEvent é o payload enviado pelo Asaas via webhook
type AsaasEvent struct {
	Event   string `json:"event"`
	Payment struct {
		ID     string  `json:"id"`
		Status string  `json:"status"`
		Value  float64 `json:"value"`
	} `json:"payment"`
}

// WooviEvent é o payload enviado pela Woovi (OpenPix) via webhook
type WooviEvent struct {
	Event       string `json:"event"`
	Transaction struct {
		ID            string  `json:"identifier"`
		CorrelationID string  `json:"correlationID"`
		Value         int     `json:"value"` // em centavos
		Status        string  `json:"status"`
		Charge        struct {
			ID string `json:"identifier"`
		} `json:"charge"`
	} `json:"transaction"`
}

// Handle — POST /webhooks/pix
func (h *WebhookHandler) Handle(w http.ResponseWriter, r *http.Request) {
	var bodyMap map[string]interface{}
	bodyBytes, _ := io.ReadAll(r.Body)
	json.Unmarshal(bodyBytes, &bodyMap)

	// Identificar se o evento é do Asaas ou da Woovi
	if _, isWoovi := bodyMap["transaction"]; isWoovi {
		h.handleWoovi(w, bodyBytes)
	} else {
		h.handleAsaas(w, bodyBytes, r.Header.Get("asaas-access-token"))
	}
}

func (h *WebhookHandler) handleAsaas(w http.ResponseWriter, body []byte, token string) {
	if h.secret != "" && token != h.secret {
		log.Printf("[WEBHOOK-ASAAS] Token inválido")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var event AsaasEvent
	json.Unmarshal(body, &event)

	switch event.Event {
	case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED":
		h.processPaymentConfirmed(event.Payment.ID, w)
	default:
		w.WriteHeader(http.StatusOK)
	}
}

func (h *WebhookHandler) handleWoovi(w http.ResponseWriter, body []byte) {
	var event WooviEvent
	json.Unmarshal(body, &event)

	log.Printf("[WEBHOOK-WOOVI] Evento recebido: %s | charge: %s", event.Event, event.Transaction.Charge.ID)

	if event.Event == "OPENPIX:TRANSACTION_RECEIVED" || event.Transaction.Status == "APPROVED" {
		h.processPaymentConfirmed(event.Transaction.Charge.ID, w)
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *WebhookHandler) processPaymentConfirmed(chargeID string, w http.ResponseWriter) {
	// 1. Buscar detalhes da transação no nosso banco
	merchantID, liquido, taxa, isTest, status, err := h.txRepo.GetInfoByChargeID(chargeID)
	if err != nil {
		log.Printf("[WEBHOOK] Transação %s não encontrada no gateway", chargeID)
		w.WriteHeader(http.StatusOK)
		return
	}

	if status == "pago" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Iniciar Transação Atômica
	tx, err := h.db.Begin()
	if err != nil {
		http.Error(w, "erro interno", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// 3. Atualizar status
	if _, err := tx.Exec("UPDATE transactions SET status='pago' WHERE asaas_charge_id=$1", chargeID); err != nil {
		return
	}

	// 4. Creditar Wallet lojista
	desc := "Pagamento via PIX"
	if err := h.walRepo.CreditWallet(tx, merchantID, liquido, "pay_"+chargeID, desc, isTest); err != nil {
		return
	}

	// 5. Creditar lucro master
	if taxa > 0 {
		descLucro := fmt.Sprintf("Taxa 0,99%% de pay_%s", chargeID)
		h.walRepo.CreditWallet(tx, 1, taxa, "fee_"+chargeID, descLucro, isTest)
	}

	if err := tx.Commit(); err != nil {
		return
	}

	log.Printf("[WEBHOOK] ✅ Pagamento confirmado: %s", chargeID)
	w.WriteHeader(http.StatusOK)
}
