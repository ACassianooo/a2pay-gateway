// Package dto define os objetos de transferência de dados (Data Transfer Objects).
// DTOs isolam a estrutura da API da estrutura interna do domínio.
package dto

// ── Requests ──────────────────────────────────────────────────────────────────

type CreateIntentRequest struct {
	MerchantID int     `json:"merchant_id"`
	ItemName   string  `json:"item_name"`
	ValorTotal float64 `json:"valor_total"`
}

type ProcessPaymentRequest struct {
	IntentID int    `json:"intent_id"`
	Metodo   string `json:"metodo"` // "pix" | "cartao"
	Cartao   string `json:"cartao"` // token gato_tk_...
}

type TokenizeCardRequest struct {
	CardNumber string `json:"card_number"`
	Validade   string `json:"validade"`
	CVV        string `json:"cvv"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ExternalPixRequest struct {
	Valor         float64 `json:"valor"`
	Descricao     string  `json:"descricao"`
	CustomerName  string  `json:"customer_name"`
	CustomerEmail string  `json:"customer_email"`
	CustomerCPF   string  `json:"customer_cpf"`
}

// ── Responses ─────────────────────────────────────────────────────────────────

type IntentResponse struct {
	IntentID int64   `json:"intent_id"`
	Status   string  `json:"status"`
	Taxa     float64 `json:"taxa"`
}

type PIXPaymentResponse struct {
	Message      string `json:"message"`
	ChargeID     string `json:"charge_id"`
	Status       string `json:"status"`
	PIXQRCode    string `json:"pix_qrcode,omitempty"`
	PIXCopaCola  string `json:"pix_copia_cola,omitempty"`
	PIXExpiracao string `json:"pix_expiracao,omitempty"`
}

type CardPaymentResponse struct {
	Message string  `json:"message"`
	Taxa    float64 `json:"taxa"`
	Liquido float64 `json:"liquido"`
}

type TokenizeResponse struct {
	Token string `json:"token"`
}

type AuthResponse struct {
	Token   string `json:"token"`
	Role    string `json:"role"`
	Message string `json:"message,omitempty"`
}

type APIKeyResponse struct {
	APIKey       string `json:"api_key"`
	Capabilities string `json:"capabilities"`
	CreatedAt    string `json:"created_at"`
	Endpoint     string `json:"endpoint"`
}

type ExternalPixResponse struct {
	ID           int64   `json:"id"`
	ChargeID     string  `json:"charge_id"`
	Status       string  `json:"status"`
	Valor        float64 `json:"valor"`
	TaxaGateway  float64 `json:"taxa_gateway"`
	ValorLiquido float64 `json:"valor_liquido"`
	PIXQRCode    string  `json:"pix_qrcode,omitempty"`
	PIXCopaCola  string  `json:"pix_copia_cola,omitempty"`
	PIXExpiracao string  `json:"pix_expiracao,omitempty"`
}

type ErrorResponse struct {
	Error   string   `json:"error"`
	Code    string   `json:"code,omitempty"`
	Motivos []string `json:"motivos,omitempty"`
	Score   int      `json:"score,omitempty"`
}

type HealthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
	DB      string `json:"db"`
}
