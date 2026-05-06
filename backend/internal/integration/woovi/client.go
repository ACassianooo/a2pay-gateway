package woovi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gato-gateway/internal/integration/pix"
)

// Client implementa a integração com a API da Woovi (OpenPix)
type Client struct {
	appID   string
	baseURL string
	http    *http.Client
}

// NewClient cria um novo cliente para a Woovi
func NewClient(appID, baseURL string) *Client {
	if baseURL == "" {
		baseURL = "https://api.woovi.com"
	}
	return &Client{
		appID:   appID,
		baseURL: baseURL,
		http:    &http.Client{Timeout: 15 * time.Second},
	}
}

// Tipos de dados Woovi
type ChargeRequest struct {
	CorrelationID string            `json:"correlationID"`
	Value         int               `json:"value"` // Centavos
	Comment       string            `json:"comment,omitempty"`
	Customer      *WooviCustomer    `json:"customer,omitempty"`
}

type WooviCustomer struct {
	Name    string `json:"name,omitempty"`
	TaxID   string `json:"taxID,omitempty"` // CPF ou CNPJ
	Email   string `json:"email,omitempty"`
	Phone   string `json:"phone,omitempty"`
}

type ChargeResponse struct {
	Charge struct {
		ID            string `json:"identifier"`
		CorrelationID string `json:"correlationID"`
		Value         int    `json:"value"`
		Status        string `json:"status"`
		BRCode        string `json:"brCode"`
		QRCodeImage   string `json:"qrCodeImage"`
	} `json:"charge"`
}

// CreatePixCharge cria uma cobrança PIX na Woovi
func (c *Client) CreatePixCharge(customerID string, valor float64, descricao string) (string, error) {
	correlationID := fmt.Sprintf("gato_%d", time.Now().UnixNano())
	payload := ChargeRequest{
		CorrelationID: correlationID,
		Value:         int(valor * 100), // Converte para centavos
		Comment:       descricao,
		Customer: &WooviCustomer{
			Name:  "Cliente A2Pay Gateway",
			TaxID: customerID, // Aqui passamos o CPF que veio do CreateCustomer
			Email: "cliente@a2pay.com",
		},
	}

	body, status, err := c.do("POST", "/api/v1/charge", payload)
	if err != nil {
		return "", err
	}

	if status != 200 && status != 201 {
		return "", fmt.Errorf("woovi CreatePixCharge status %d: %s", status, string(body))
	}

	var resp ChargeResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return "", err
	}

	return resp.Charge.ID, nil
}

// Implementação da interface PIXProvider para compatibilidade parcial
func (c *Client) CreateCustomer(name, email, cpfCnpj string) (string, error) {
	// Woovi não precisa criar cliente separado, retornamos o CPF para uso posterior
	return cpfCnpj, nil
}

// GetPixQRCode - Na Woovi o QR Code já vem na criação da cobrança.
// Mas implementamos para seguir a interface se necessário.
func (c *Client) GetPixQRCode(chargeID string) (*pix.PixQRCode, error) {
	body, status, err := c.do("GET", "/api/v1/charge/"+chargeID, nil)
	if err != nil {
		return nil, err
	}

	if status != 200 {
		return nil, fmt.Errorf("woovi GetCharge status %d: %s", status, string(body))
	}

	var resp ChargeResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	return &pix.PixQRCode{
		EncodedImage: resp.Charge.QRCodeImage,
		Payload:      resp.Charge.BRCode,
	}, nil
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

func (c *Client) do(method, path string, body interface{}) ([]byte, int, error) {
	var bodyReader io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		bodyReader = bytes.NewBuffer(b)
	}
	req, err := http.NewRequest(method, c.baseURL+path, bodyReader)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Authorization", c.appID)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, nil
}
