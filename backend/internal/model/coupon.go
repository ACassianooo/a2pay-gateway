package model

import "time"

type Coupon struct {
	ID            int       `json:"id"`
	MerchantID    int       `json:"merchant_id"`
	Code          string    `json:"code"`
	DiscountType  string    `json:"discount_type"` // "fixo", "percentual"
	DiscountValue float64   `json:"discount_value"`
	MaxUses       int       `json:"max_uses"`
	UsedCount     int       `json:"used_count"`
	Status        string    `json:"status"` // "ativo", "desativado"
	CreatedAt     time.Time `json:"created_at"`
}
