package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
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

// Handle — POST /webhooks/asaas
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
		// 1. Buscar detalhes da transação no nosso banco
		merchantID, liquido, taxa, _, status, err := h.txRepo.GetInfoByChargeID(event.Payment.ID)
		if err != nil {
			log.Printf("[WEBHOOK] Transação %s não encontrada no gateway", event.Payment.ID)
			w.WriteHeader(http.StatusOK) // Evita que o Asaas reenvie se não temos a transação
			return
		}

		// Idempotência: se já estiver pago, ignorar
		if status == "pago" {
			log.Printf("[WEBHOOK] Transação %s já processada anteriormente", event.Payment.ID)
			w.WriteHeader(http.StatusOK)
			return
		}

		// 2. Iniciar Transação Atômica para Proteger o Dinheiro
		tx, err := h.db.Begin()
		if err != nil {
			log.Printf("[WEBHOOK] Erro ao iniciar transação SQL: %v", err)
			http.Error(w, "erro interno", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		// 3. Atualizar status para pago
		if _, err := tx.Exec("UPDATE transactions SET status='pago' WHERE asaas_charge_id=$1", event.Payment.ID); err != nil {
			log.Printf("[WEBHOOK] Erro ao atualizar status: %v", err)
			return
		}

		// 4. Creditar na Wallet do lojista e registrar no Ledger
		desc := "Pagamento via PIX"
		if err := h.walRepo.CreditWallet(tx, merchantID, liquido, "pay_"+event.Payment.ID, desc); err != nil {
			log.Printf("[WEBHOOK] Erro ao creditar wallet lojista: %v", err)
			return
		}

		// 5. Creditar o LUCRO na conta MASTER (A2Pay)
		if taxa > 0 {
			descLucro := fmt.Sprintf("Taxa 0,99%% de pay_%s", event.Payment.ID)
			if err := h.walRepo.CreditWallet(tx, 1, taxa, "fee_"+event.Payment.ID, descLucro); err != nil {
				log.Printf("[WEBHOOK] Erro ao creditar lucro master: %v", err)
				// Não paramos o processo se falhar o lucro, mas logamos o erro
			}
		}

		// 6. Commit final
		if err := tx.Commit(); err != nil {
			log.Printf("[WEBHOOK] Erro ao commitar transação: %v", err)
			return
		}

		log.Printf("[WEBHOOK] ✅ PIX confirmado e saldo creditado na wallet: %s (R$ %.2f)", event.Payment.ID, liquido)

	case "TRANSFER_CONFIRMATION":
		log.Printf("[WEBHOOK] 💸 Solicitação de saque recebida e APROVADA.")

	default:
		log.Printf("[WEBHOOK] Evento ignorado: %s", event.Event)
	}

	w.WriteHeader(http.StatusOK)
}
