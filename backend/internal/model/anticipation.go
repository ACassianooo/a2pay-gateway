package model

type Anticipation struct {
	ID              int     `json:"id"`
	MerchantID      int     `json:"merchant_id"`
	AmountRequested float64 `json:"amount_requested"`
	FeeAmount       float64 `json:"fee_amount"`
	NetAmount       float64 `json:"net_amount"`
	Status          string  `json:"status"`
	CreatedAt       string  `json:"created_at"`
}
