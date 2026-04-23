// Package pix implementa o client de integração com a API Asaas (PIX).
// Fica em internal/integration/ porque é uma dependência externa —
// não é regra de negócio, é comunicação com terceiros.
package pix

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gato-gateway/internal/utils"
)

// Client é o cliente HTTP para a API Asaas
type Client struct {
	apiKey  string
	baseURL string
	http    *http.Client
}

// NewClient cria um client do Asaas
func NewClient(apiKey, baseURL string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseURL: baseURL,
		http:    &http.Client{Timeout: 15 * time.Second},
	}
}

// ── Tipos de resposta da API Asaas ────────────────────────────────────────────

type Customer struct {
	ID string `json:"id"`
}

type Charge struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

type PixQRCode struct {
	EncodedImage   string `json:"encodedImage"`
	Payload        string `json:"payload"`
	ExpirationDate string `json:"expirationDate"`
}

// ── Métodos públicos ──────────────────────────────────────────────────────────

// CreateCustomer cria ou recupera um cliente no Asaas pelo email
func (c *Client) CreateCustomer(name, email, cpfCnpj string) (string, error) {
	payload := map[string]string{
		"name":     name,
		"email":    email,
		"cpfCnpj": cpfCnpj,
	}
	body, status, err := c.do("POST", "/customers", payload)
	if err != nil {
		return "", err
	}
	if status != 200 && status != 201 {
		// Tenta buscar por email se cliente já existe
		bodyGet, _, _ := c.do("GET", "/customers?email="+email, nil)
		var result struct {
			Data []Customer `json:"data"`
		}
		json.Unmarshal(bodyGet, &result)
		if len(result.Data) > 0 {
			return result.Data[0].ID, nil
		}
		return "", fmt.Errorf("asaas CreateCustomer: status %d — %s", status, string(body))
	}
	var customer Customer
	json.Unmarshal(body, &customer)
	return customer.ID, nil
}

// CreatePixCharge cria uma cobrança PIX real no Asaas
func (c *Client) CreatePixCharge(customerID string, valor float64, descricao string) (string, error) {
	payload := map[string]interface{}{
		"customer":          customerID,
		"billingType":       "PIX",
		"value":             valor,
		"dueDate":           utils.DateForAsaas(1),
		"description":       descricao,
		"externalReference": utils.NewID("gato"),
	}
	body, status, err := c.do("POST", "/payments", payload)
	if err != nil {
		return "", err
	}
	if status != 200 && status != 201 {
		return "", fmt.Errorf("asaas CreatePixCharge: status %d — %s", status, string(body))
	}
	var charge Charge
	json.Unmarshal(body, &charge)
	return charge.ID, nil
}

// GetPixQRCode busca o QR Code de uma cobrança PIX
func (c *Client) GetPixQRCode(chargeID string) (*PixQRCode, error) {
	body, status, err := c.do("GET", "/payments/"+chargeID+"/pixQrCode", nil)
	if err != nil {
		return nil, err
	}
	if status != 200 {
		return nil, fmt.Errorf("asaas GetPixQRCode: status %d — %s", status, string(body))
	}
	var qr PixQRCode
	json.Unmarshal(body, &qr)
	return &qr, nil
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
	req.Header.Set("accept", "application/json")
	req.Header.Set("content-type", "application/json")
	req.Header.Set("access_token", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, nil
}
