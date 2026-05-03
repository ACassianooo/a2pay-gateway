package model

// FraudLog registra cada análise antifraude para auditoria
type FraudLog struct {
	ID         int    `json:"id"`
	MerchantID int    `json:"merchant_id"`
	IntentID   int    `json:"intent_id"`
	IP         string `json:"ip"`
	Score      int    `json:"score"`
	Reasons    string `json:"reasons"`
	Bloqueado  bool   `json:"bloqueado"`
	CreatedAt  string `json:"created_at"`
}

// FraudResult é o resultado em memória de uma análise antifraude
type FraudResult struct {
	Score     int
	Bloqueado bool
	Reasons   []string
}

// Wallet representa o saldo consolidado do lojista
type Wallet struct {
	MerchantID int     `json:"merchant_id"`
	Balance    float64 `json:"balance"`
	IsTest     bool    `json:"is_test"`
	UpdatedAt  string  `json:"updated_at"`
}

// Withdrawal representa uma solicitação de saque
type Withdrawal struct {
	ID         int     `json:"id"`
	MerchantID int     `json:"merchant_id"`
	Amount     float64 `json:"amount"`
	PixKey     string  `json:"pix_key"`
	Status     string  `json:"status"`
	IsTest     bool    `json:"is_test"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

// LedgerEntry representa um registro no livro de auditoria
type LedgerEntry struct {
	ID          int     `json:"id"`
	MerchantID  int     `json:"merchant_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Reference   string  `json:"reference"`
	Description string  `json:"description"`
	IsTest      bool    `json:"is_test"`
	CreatedAt   string  `json:"created_at"`
}
