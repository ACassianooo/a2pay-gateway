package service

import (
	"fmt"
	"log"
	"strings"
	"net/http"
	"encoding/json"
	"time"

	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
	intpix "github.com/gato-gateway/internal/integration/pix"
)

const TaxaPIXPorc   = 0.0099
const TaxaCartaoPorc = 0.03
const TaxaCartaoFixa = 0.50

// PixClientAdapter adapta o integration/pix.PIXProvider para o service layer
type PixClientAdapter struct {
	client intpix.PIXProvider
}

func NewPixClientAdapter(client intpix.PIXProvider) *PixClientAdapter {
	return &PixClientAdapter{client: client}
}

func (a *PixClientAdapter) CreateCustomer(name, email, cpf string) (string, error) {
	return a.client.CreateCustomer(name, email, cpf)
}

func (a *PixClientAdapter) CreatePixCharge(customerID string, valor float64, desc string) (string, error) {
	return a.client.CreatePixCharge(customerID, valor, desc)
}

func (a *PixClientAdapter) GetPixQRCode(chargeID string) (*intpix.PixQRCode, error) {
	return a.client.GetPixQRCode(chargeID)
}

// PIXResult é o resultado de uma cobrança PIX criada com sucesso
type PIXResult struct {
	ChargeID  string
	QRCode    string
	CopaCola  string
	Expiracao string
	Valor     float64
	Liquido   float64
	Taxa      float64
}

// PIXService orquestra a lógica de cobrança PIX
type PIXService struct {
	clientLive *PixClientAdapter
	clientTest *PixClientAdapter
	txRepo     *repository.TransactionRepository
	custRepo   *repository.CustomerRepository
}

func NewPIXService(live, test *PixClientAdapter, txRepo *repository.TransactionRepository, custRepo *repository.CustomerRepository) *PIXService {
	return &PIXService{clientLive: live, clientTest: test, txRepo: txRepo, custRepo: custRepo}
}

func (s *PIXService) CreateCharge(intentID int, valor float64, itemName string, isSandbox bool) (*PIXResult, error) {
	log.Printf("[DEBUG] Iniciando CreateCharge para intent %d, valor %.2f", intentID, valor)
	taxa := valor * TaxaPIXPorc
	liquido := valor - taxa

	client := s.clientLive
	if isSandbox {
		client = s.clientTest
	}

	customerID, err := client.CreateCustomer("Cliente A2Pay Gateway", "cliente@a2pay.com", "24971563792")
	if err != nil {
		log.Printf("[ERROR] Erro ao criar cliente Asaas: %v", err)
		return nil, fmt.Errorf("criar cliente Asaas: %w", err)
	}
	log.Printf("[DEBUG] Cliente Asaas criado/recuperado: %s", customerID)

	chargeID, err := client.CreatePixCharge(customerID, valor, itemName)
	if err != nil {
		log.Printf("[ERROR] Erro ao criar cobrança PIX: %v", err)
		return nil, fmt.Errorf("criar cobrança PIX: %w", err)
	}
	log.Printf("[DEBUG] Cobrança PIX criada: %s", chargeID)

	// Busca o merchantID para salvar o cliente corretamente
	_, mID, _, _, _, _ := s.txRepo.GetByID(intentID)
	s.custRepo.Create(model.Customer{
		ID:         customerID,
		MerchantID: mID,
		Name:       "Cliente A2Pay Gateway",
		Email:      "cliente@a2pay.com",
		CPF:        "24971563792",
		IsTest:     isSandbox,
	})

	s.txRepo.UpdateToAguardandoPIX(intentID, taxa, liquido, chargeID)
	log.Printf("[PIX] Cobrança criada (%s): %s | R$ %.2f", map[bool]string{true: "TEST", false: "LIVE"}[isSandbox], chargeID, valor)

	if isSandbox {
		go func() {
			time.Sleep(3 * time.Second)
			s.txRepo.ConfirmPIX(chargeID)
			log.Printf("[SANDBOX MOCK] Pagamento PIX %s finalizado automaticamente.", chargeID)
		}()
	}

	result := &PIXResult{ChargeID: chargeID, Valor: valor, Taxa: taxa, Liquido: liquido}
	if qr, err := client.GetPixQRCode(chargeID); err == nil && qr != nil {
		result.QRCode = qr.EncodedImage
		result.CopaCola = qr.Payload
		result.Expiracao = qr.ExpirationDate
	}
	return result, nil
}

// ExternalPixRequest é o payload recebido via API Key (POST /api/v1/pix)
type ExternalPixRequest struct {
	Valor         float64 `json:"valor"`
	Descricao     string  `json:"descricao"`
	CustomerName  string  `json:"customer_name"`
	CustomerEmail string  `json:"customer_email"`
	CustomerCPF   string  `json:"customer_cpf"`
}

func (s *PIXService) ExternalCharge(merchantID int, req ExternalPixRequest, isSandbox bool) (int64, *PIXResult, error) {
	if req.Descricao == "" {
		req.Descricao = "Pagamento via A2Pay"
	}
	if req.CustomerName == "" {
		req.CustomerName = "Cliente"
	}
	if req.CustomerEmail == "" {
		req.CustomerEmail = "cliente@a2pay.com"
	}
	if req.CustomerCPF == "" {
		req.CustomerCPF = "24971563792"
	}

	taxa := req.Valor * TaxaPIXPorc
	liquido := req.Valor - taxa

	client := s.clientLive
	if isSandbox {
		client = s.clientTest
	}

	if client == nil {
		envName := "PRODUÇÃO"
		if isSandbox {
			envName = "TESTE"
		}
		return 0, nil, fmt.Errorf("gateway PIX não configurado para ambiente de %s. Verifique suas credenciais (Inter ou Asaas)", envName)
	}

	intentID, err := s.txRepo.Create(merchantID, req.Descricao, req.Valor, liquido, taxa, "pix", isSandbox, nil)
	if err != nil {
		return 0, nil, err
	}

	customerID, err := client.CreateCustomer(req.CustomerName, req.CustomerEmail, req.CustomerCPF)
	if err != nil {
		return intentID, nil, fmt.Errorf("criar cliente Asaas: %w", err)
	}

	chargeID, err := client.CreatePixCharge(customerID, req.Valor, req.Descricao)
	if err != nil {
		return intentID, nil, fmt.Errorf("criar cobrança PIX: %w", err)
	}

	// Salva no nosso banco para a aba "Clientes"
	s.custRepo.Create(model.Customer{
		ID:         customerID,
		MerchantID: merchantID,
		Name:       req.CustomerName,
		Email:      req.CustomerEmail,
		CPF:        req.CustomerCPF,
		IsTest:     isSandbox,
	})

	s.txRepo.SetChargeID(intentID, chargeID)

	if isSandbox {
		go func() {
			time.Sleep(3 * time.Second)
			s.txRepo.ConfirmPIX(chargeID)
			log.Printf("[SANDBOX MOCK EXTERNAL] Pagamento PIX %s finalizado automaticamente.", chargeID)
		}()
	}

	result := &PIXResult{ChargeID: chargeID, Valor: req.Valor, Taxa: taxa, Liquido: liquido}
	if qr, err := client.GetPixQRCode(chargeID); err == nil && qr != nil {
		result.QRCode = qr.EncodedImage
		result.CopaCola = qr.Payload
		result.Expiracao = qr.ExpirationDate
	}
	return intentID, result, nil
}

// FraudService executa as 4 regras antifraude
type FraudService struct {
	txRepo  *repository.TransactionRepository
	walRepo *repository.WalletRepository
}

func NewFraudService(txRepo *repository.TransactionRepository, walRepo *repository.WalletRepository) *FraudService {
	return &FraudService{txRepo: txRepo, walRepo: walRepo}
}

func checkGeoIP(ip string) string {
	if ip == "" || ip == "::1" || strings.HasPrefix(ip, "127.") ||
		strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") {
		return "BR"
	}
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get("http://ip-api.com/json/" + ip + "?fields=countryCode,proxy,hosting")
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	var r struct {
		CountryCode string `json:"countryCode"`
		Proxy       bool   `json:"proxy"`
		Hosting     bool   `json:"hosting"`
	}
	json.NewDecoder(resp.Body).Decode(&r)
	if r.Proxy || r.Hosting {
		return "PROXY"
	}
	return r.CountryCode
}

func (f *FraudService) Check(merchantID, intentID int, valor float64, ip string) model.FraudResult {
	result := model.FraudResult{}

	if n := f.walRepo.CountBlockedByIP(ip); n >= 3 {
		result.Score += 60
		result.Reasons = append(result.Reasons, fmt.Sprintf("IP com %d bloqueios recentes", n))
	} else if n >= 1 {
		result.Score += 25
		result.Reasons = append(result.Reasons, fmt.Sprintf("IP com histórico de fraudes: %s", ip))
	}

	if tx := f.txRepo.CountRecentByMerchant(merchantID); tx >= 10 {
		result.Score += 50
		result.Reasons = append(result.Reasons, fmt.Sprintf("Volume anômalo: %d tx em 5 min", tx))
	} else if tx >= 5 {
		result.Score += 20
		result.Reasons = append(result.Reasons, fmt.Sprintf("Volume elevado: %d tx em 5 min", tx))
	}

	if valor > 5000 {
		result.Score += 20
		result.Reasons = append(result.Reasons, fmt.Sprintf("Alto valor: R$ %.2f", valor))
	}
	if avg, total := f.txRepo.GetAvgValue(merchantID); total >= 3 && avg > 0 {
		if r := valor / avg; r > 10 {
			result.Score += 40
			result.Reasons = append(result.Reasons, fmt.Sprintf("Valor %.0fx acima da média (R$ %.2f)", r, avg))
		} else if r > 5 {
			result.Score += 20
			result.Reasons = append(result.Reasons, fmt.Sprintf("Valor %.0fx acima da média (R$ %.2f)", r, avg))
		}
	}

	switch checkGeoIP(ip) {
	case "PROXY":
		result.Score += 50
		result.Reasons = append(result.Reasons, "IP proxy/VPN detectado")
	case "BR", "":
	default:
		result.Score += 40
		result.Reasons = append(result.Reasons, fmt.Sprintf("Geolocalização fora do Brasil: %s", checkGeoIP(ip)))
	}

	result.Bloqueado = result.Score >= 60
	reasons := strings.Join(result.Reasons, " | ")
	f.walRepo.InsertFraudLog(merchantID, intentID, ip, result.Score, reasons, result.Bloqueado)

	if result.Bloqueado {
		log.Printf("[ANTIFRAUDE] 🚨 BLOQUEADO merchant=%d score=%d ip=%s | %s", merchantID, result.Score, ip, reasons)
	} else if result.Score > 0 {
		log.Printf("[ANTIFRAUDE] ⚠️  score=%d merchant=%d ip=%s | %s", result.Score, merchantID, ip, reasons)
	}
	return result
}

// PaymentService orquestra o fluxo de pagamento
type PaymentService struct {
	txRepo   *repository.TransactionRepository
	prodRepo *repository.ProductRepository
	pix      *PIXService
	wallet   *WalletService
	fraud    *FraudService
}

func NewPaymentService(txRepo *repository.TransactionRepository, prodRepo *repository.ProductRepository, pix *PIXService, wallet *WalletService, fraud *FraudService) *PaymentService {
	return &PaymentService{txRepo: txRepo, prodRepo: prodRepo, pix: pix, wallet: wallet, fraud: fraud}
}

func (s *PaymentService) CreateIntent(merchantID int, itemName string, valor float64, isSandbox bool, metadata map[string]interface{}) (int64, error) {
	if valor <= 0.01 {
		return 0, fmt.Errorf("valor mínimo: R$ 0.01")
	}
	taxa := valor * TaxaPIXPorc
	metaBytes, _ := json.Marshal(metadata)
	
	// Registro Automático de Produto
	_ = s.prodRepo.EnsureExists(merchantID, itemName, valor, "uma_vez", isSandbox)
	
	return s.txRepo.Create(merchantID, itemName, valor, valor-taxa, taxa, "N/A", isSandbox, metaBytes)
}

func (s *PaymentService) GetIntent(id int) (map[string]interface{}, error) {
	valor, mID, isTest, status, metaBytes, err := s.txRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	name := s.txRepo.GetItemName(id)
	
	var metadata map[string]interface{}
	if len(metaBytes) > 0 {
		json.Unmarshal(metaBytes, &metadata)
	}

	return map[string]interface{}{
		"id":          id,
		"merchant_id": mID,
		"item_name":   name,
		"valor_total": valor,
		"status":      status,
		"is_test":     isTest,
		"metadata":    metadata,
	}, nil
}

func (s *PaymentService) ProcessPIX(intentID int, clientIP string) (*PIXResult, error) {
	log.Printf("[DEBUG] Processando PIX para intent %d (IP: %s)", intentID, clientIP)
	valor, merchantID, isSandbox, _, _, err := s.txRepo.GetByID(intentID)
	if err != nil {
		log.Printf("[ERROR] Intent %d não encontrado: %v", intentID, err)
		return nil, fmt.Errorf("intent %d não encontrado", intentID)
	}
	fraud := s.fraud.Check(merchantID, intentID, valor, clientIP)
	if fraud.Bloqueado {
		return nil, &FraudError{Score: fraud.Score, Reasons: fraud.Reasons}
	}
	return s.pix.CreateCharge(intentID, valor, s.txRepo.GetItemName(intentID), isSandbox)
}

func (s *PaymentService) ProcessCard(intentID int, token string, clientIP string) (*CardResult, error) {
	valor, merchantID, _, _, _, err := s.txRepo.GetByID(intentID)
	if err != nil {
		return nil, fmt.Errorf("intent %d não encontrado", intentID)
	}
	fraud := s.fraud.Check(merchantID, intentID, valor, clientIP)
	if fraud.Bloqueado {
		return nil, &FraudError{Score: fraud.Score, Reasons: fraud.Reasons}
	}
	realCard, err := s.wallet.Resolve(token)
	if err != nil {
		return nil, err
	}
	if !mockCardApproval(valor, realCard) {
		return nil, fmt.Errorf("cartão recusado pela rede")
	}
	taxa    := (valor * TaxaCartaoPorc) + TaxaCartaoFixa
	liquido := valor - taxa
	if err := s.txRepo.UpdateToPago(intentID, "cartao", taxa, liquido); err != nil {
		return nil, err
	}
	return &CardResult{Taxa: taxa, Liquido: liquido}, nil
}

func mockCardApproval(valor float64, _ string) bool { return valor > 0 && valor < 50000 }

type CardResult  struct { Taxa, Liquido float64 }
type FraudError  struct { Score int; Reasons []string }
func (e *FraudError) Error() string { return fmt.Sprintf("antifraude bloqueou (score=%d)", e.Score) }
