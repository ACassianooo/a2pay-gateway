package repository

import (
	"database/sql"
	"time"
)

type PaymentLink struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Amount    *float64  `json:"amount"` // Usando ponteiro para permitir null
	Status    string    `json:"status"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
}

type PaymentLinkRepository struct {
	db *sql.DB
}

func NewPaymentLinkRepository(db *sql.DB) *PaymentLinkRepository {
	return &PaymentLinkRepository{db: db}
}

func (r *PaymentLinkRepository) Create(merchantID int, name string, amount *float64, url string) (int64, error) {
	var id int64
	err := r.db.QueryRow(
		`INSERT INTO payment_links(merchant_id, name, amount, url) VALUES($1, $2, $3, $4) RETURNING id`,
		merchantID, name, amount, url,
	).Scan(&id)
	return id, err
}

func (r *PaymentLinkRepository) ListByMerchant(merchantID int) ([]PaymentLink, error) {
	rows, err := r.db.Query(`SELECT id, name, amount, status, url, created_at FROM payment_links WHERE merchant_id = $1 ORDER BY id DESC`, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []PaymentLink
	for rows.Next() {
		var l PaymentLink
		err := rows.Scan(&l.ID, &l.Name, &l.Amount, &l.Status, &l.URL, &l.CreatedAt)
		if err != nil {
			return nil, err
		}
		links = append(links, l)
	}
	
	if links == nil {
		links = []PaymentLink{}
	}
	return links, nil
}
