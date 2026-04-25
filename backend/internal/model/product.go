package model

import "time"

type Product struct {
	ID          int       `json:"id"`
	MerchantID  int       `json:"merchant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Price       float64   `json:"price"`
	Cycle       string    `json:"cycle"` // "uma_vez" ou "recorrente"
	ImageURL    string    `json:"image_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
