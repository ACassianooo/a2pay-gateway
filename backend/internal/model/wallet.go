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
