package model

import "time"

type Dispute struct {
	ID                int       `json:"id" db:"id"`
	TransactionID     int       `json:"transaction_id" db:"transaction_id"`
	MerchantID        int       `json:"merchant_id" db:"merchant_id"`
	Amount            float64   `json:"amount" db:"amount"`
	Reason            string    `json:"reason" db:"reason"`
	Status            string    `json:"status" db:"status"`
	EvidenceDeadline *time.Time `json:"evidence_deadline" db:"evidence_deadline"`
	IsTest            bool      `json:"is_test" db:"is_test"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
	
	// Adicionais para facilitar o frontend
	CustomerName      string    `json:"customer_name,omitempty"`
}
