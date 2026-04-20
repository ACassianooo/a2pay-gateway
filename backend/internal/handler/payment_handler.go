package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/gato-gateway/internal/dto"
	apierrors "github.com/gato-gateway/internal/errors"
	intpix "github.com/gato-gateway/internal/integration/pix"
	"github.com/gato-gateway/internal/service"
)

// PaymentHandler — apenas HTTP: recebe, delega ao service, responde
type PaymentHandler struct {
	payment *service.PaymentService
	pix     *service.PIXService
	wallet  *service.WalletService
	client  *service.PixClientAdapter
}

func NewPaymentHandler(
	payment *service.PaymentService,
	pix *service.PIXService,
	wallet *service.WalletService,
	client *service.PixClientAdapter,
) *PaymentHandler {
	return &PaymentHandler{payment: payment, pix: pix, wallet: wallet, client: client}
}

// CreateIntent — POST /api/pagamentos/intent
func (h *PaymentHandler) CreateIntent(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondErr(w, apierrors.InvalidInput(err.Error()))
		return
	}
	if req.MerchantID == 0 {
		req.MerchantID = 2
	}
	id, err := h.payment.CreateIntent(req.MerchantID, req.ItemName, req.ValorTotal)
	if err != nil {
		respondErr(w, apierrors.InvalidInput(err.Error()))
		return
	}
	respondJSON(w, http.StatusOK, dto.IntentResponse{
		IntentID: id,
		Status:   "pendente",
		Taxa:     service.TaxaFixaPIX,
	})
}

// ProcessPayment — POST /api/pagamentos/processar
func (h *PaymentHandler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	var req dto.ProcessPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondErr(w, apierrors.InvalidInput(err.Error()))
		return
	}

	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	if ip == "" {
		ip = r.RemoteAddr
	}

	switch req.Metodo {
	case "pix":
		result, err := h.payment.ProcessPIX(req.IntentID, ip)
		if err != nil {
			handlePaymentError(w, err)
			return
		}
		respondJSON(w, http.StatusOK, dto.PIXPaymentResponse{
			Message:     "Cobrança PIX criada com sucesso",
			ChargeID:    result.ChargeID,
			Status:      "aguardando_pix",
			PIXQRCode:   result.QRCode,
			PIXCopaCola: result.CopaCola,
			PIXExpiracao: result.Expiracao,
		})

	case "cartao":
		result, err := h.payment.ProcessCard(req.IntentID, req.Cartao, ip)
		if err != nil {
			handlePaymentError(w, err)
			return
		}
		respondJSON(w, http.StatusOK, dto.CardPaymentResponse{
			Message: "Pagamento processado com sucesso",
			Taxa:    result.Taxa,
			Liquido: result.Liquido,
		})

	default:
		respondErr(w, apierrors.InvalidInput(fmt.Sprintf("método '%s' inválido. Use 'pix' ou 'cartao'", req.Metodo)))
	}
}

// GetPixQRCode — GET /api/pagamentos/pix/{charge_id}/qrcode
func (h *PaymentHandler) GetPixQRCode(w http.ResponseWriter, r *http.Request) {
	chargeID := chi.URLParam(r, "charge_id")
	if chargeID == "" {
		respondErr(w, apierrors.InvalidInput("charge_id obrigatório"))
		return
	}
	qr, err := h.client.GetPixQRCode(chargeID)
	if err != nil {
		respondErr(w, apierrors.ExternalService("Asaas", err))
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{
		"pix_qrcode":     qr.EncodedImage,
		"pix_copia_cola": qr.Payload,
		"pix_expiracao":  qr.ExpirationDate,
	})
}

// TokenizeCard — POST /api/vault/tokenize
func (h *PaymentHandler) TokenizeCard(w http.ResponseWriter, r *http.Request) {
	var req dto.TokenizeCardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondErr(w, apierrors.InvalidInput(err.Error()))
		return
	}
	token := h.wallet.Tokenize(req.CardNumber, req.Validade, req.CVV)
	respondJSON(w, http.StatusOK, dto.TokenizeResponse{Token: token})
}

// ExternalPixCharge — POST /api/v1/pix
func (h *PaymentHandler) ExternalPixCharge(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)

	var req dto.ExternalPixRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "JSON inválido"})
		return
	}
	if !strings.Contains(user.APICapabilities, "pix") {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error: "Forbidden - A chave de API não possui escopo para pagamentos via PIX.",
		})
		return
	}
	if req.Valor <= service.TaxaFixaPIX {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error: fmt.Sprintf("Valor mínimo: R$ %.2f", service.TaxaFixaPIX+0.01),
		})
		return
	}

	svcReq := service.ExternalPixRequest{
		Valor:         req.Valor,
		Descricao:     req.Descricao,
		CustomerName:  req.CustomerName,
		CustomerEmail: req.CustomerEmail,
		CustomerCPF:   req.CustomerCPF,
	}

	intentID, result, err := h.pix.ExternalCharge(user.MerchantID, svcReq)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, dto.ExternalPixResponse{
		ID:           intentID,
		ChargeID:     result.ChargeID,
		Status:       "aguardando_pix",
		Valor:        result.Valor,
		TaxaGateway:  result.Taxa,
		ValorLiquido: result.Liquido,
		PIXQRCode:    result.QRCode,
		PIXCopaCola:  result.CopaCola,
		PIXExpiracao: result.Expiracao,
	})
}

// ── Helpers ──────────────────────────────────────────────────────────────────

func handlePaymentError(w http.ResponseWriter, err error) {
	var fraudErr *service.FraudError
	if errors.As(err, &fraudErr) {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error:   "Transação bloqueada pelo sistema antifraude.",
			Score:   fraudErr.Score,
			Motivos: fraudErr.Reasons,
		})
		return
	}
	respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
}

// GetPixQRCodeFromClient é usado no handler para obter o client diretamente
func getQRFromClient(client *service.PixClientAdapter, chargeID string) (*intpix.PixQRCode, error) {
	return client.GetPixQRCode(chargeID)
}
