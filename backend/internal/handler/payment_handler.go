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
	payment     *service.PaymentService
	pix         *service.PIXService
	wallet      *service.WalletService
	clientLive  *service.PixClientAdapter
	clientTest  *service.PixClientAdapter
}

func NewPaymentHandler(
	payment *service.PaymentService,
	pix *service.PIXService,
	wallet *service.WalletService,
	live *service.PixClientAdapter,
	test *service.PixClientAdapter,
) *PaymentHandler {
	return &PaymentHandler{
		payment:     payment,
		pix:         pix,
		wallet:      wallet,
		clientLive:  live,
		clientTest:  test,
	}
}

// CreateIntent — POST /api/pagamentos/intent
func (h *PaymentHandler) CreateIntent(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r) // Se for logado via Dashboard

	var req dto.CreateIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[DEBUG] CreateIntent: erro decode: %v", err)
		respondErr(w, apierrors.InvalidInput(err.Error()))
		return
	}
	
	// Se não tiver usuário no context (ex: checkout público), o MerchantID vem do request
	merchantID := req.MerchantID
	isSandbox := r.Header.Get("x-a2pay-env") == "test"

	if user.MerchantID != 0 {
		merchantID = user.MerchantID
	}

	log.Printf("[DEBUG] CreateIntent: merchantID=%d, valor=%.10f, sandbox=%v", merchantID, req.ValorTotal, isSandbox)

	id, err := h.payment.CreateIntent(merchantID, req.ItemName, req.ValorTotal, isSandbox, req.Metadata)
	if err != nil {
		respondErr(w, apierrors.InvalidInput(err.Error()))
		return
	}
	respondJSON(w, http.StatusOK, dto.IntentResponse{
		IntentID: id,
		Status:   "pendente",
		Taxa:     req.ValorTotal * service.TaxaPIXPorc,
	})
}

// GetIntent — GET /api/pagamentos/intent/{id}
func (h *PaymentHandler) GetIntent(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	var id int
	fmt.Sscanf(idStr, "%d", &id)

	if id == 0 {
		respondErr(w, apierrors.InvalidInput("ID inválido"))
		return
	}

	intent, err := h.payment.GetIntent(id)
	if err != nil {
		respondErr(w, apierrors.NotFound("Pagamento"))
		return
	}

	respondJSON(w, http.StatusOK, intent)
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

	// Precisamos saber se essa chargeID é de teste ou real. 
	// Para o QR Code no checkout, tentamos na sandbox e depois na live, ou usamos flag do DB.
	// Por simplicidade, tentamos na sandbox primeiro se falhar vai pra live,
	// mas o ideal é passar o env na URL. Vamos tentar nas duas:
	qr, err := h.clientTest.GetPixQRCode(chargeID)
	if err != nil {
		qr, err = h.clientLive.GetPixQRCode(chargeID)
	}

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
	if req.Valor <= 0.01 {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error: "Valor mínimo: R$ 0.01",
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

	intentID, result, err := h.pix.ExternalCharge(user.MerchantID, svcReq, user.IsSandbox)
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
