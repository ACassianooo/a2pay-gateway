package dto

import "time"

type CreateSubscriptionRequest struct {
	ClienteNome   string  `json:"cliente_nome"`
	ClienteEmail  string  `json:"cliente_email"`
	ClienteCPF    string  `json:"cliente_cpf"`
	PlanoNome     string  `json:"plano_nome"`
	Valor         float64 `json:"valor"`
	IntervaloDias int     `json:"intervalo_dias"`
}

type SubscriptionResponse struct {
	ID                int       `json:"id"`
	MerchantID        int       `json:"merchant_id"`
	ClienteNome       string    `json:"cliente_nome"`
	ClienteEmail      string    `json:"cliente_email"`
	PlanoNome         string    `json:"plano_nome"`
	Valor             float64   `json:"valor"`
	Status            string    `json:"status"`
	IntervaloDias     int       `json:"intervalo_dias"`
	NextBillingDate   time.Time `json:"next_billing_date"`
	CurrentChargeTxID string    `json:"current_charge_txid"`
	PixCopyPaste      string    `json:"pix_copy_paste,omitempty"`
	PixQRCode         string    `json:"pix_qr_code,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}
