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
	IsTest    bool      `json:"is_test"`
	CreatedAt time.Time `json:"created_at"`
}

type PaymentLinkRepository struct {
	db *sql.DB
}

func NewPaymentLinkRepository(db *sql.DB) *PaymentLinkRepository {
	return &PaymentLinkRepository{db: db}
}

func (r *PaymentLinkRepository) Create(merchantID int, name string, amount *float64, url string, isTest bool) (int64, error) {
	var id int64
	err := r.db.QueryRow(
		`INSERT INTO payment_links(merchant_id, name, amount, url, is_test) VALUES($1, $2, $3, $4, $5) RETURNING id`,
		merchantID, name, amount, url, isTest,
	).Scan(&id)
	return id, err
}

func (r *PaymentLinkRepository) ListByMerchant(merchantID int, isTest bool) ([]PaymentLink, error) {
	rows, err := r.db.Query(`SELECT id, name, amount, status, url, is_test, created_at FROM payment_links WHERE merchant_id = $1 AND is_test = $2 ORDER BY id DESC`, merchantID, isTest)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []PaymentLink
	for rows.Next() {
		var l PaymentLink
		err := rows.Scan(&l.ID, &l.Name, &l.Amount, &l.Status, &l.URL, &l.IsTest, &l.CreatedAt)
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

type PaymentLinkWithMerchant struct {
	PaymentLink
	MerchantID int `json:"merchant_id"`
}

func (r *PaymentLinkRepository) GetByURL(url string) (*PaymentLinkWithMerchant, error) {
	var l PaymentLinkWithMerchant
	err := r.db.QueryRow(`SELECT id, merchant_id, name, amount, status, url, is_test, created_at FROM payment_links WHERE url LIKE '%' || $1`, url).
		Scan(&l.ID, &l.MerchantID, &l.Name, &l.Amount, &l.Status, &l.URL, &l.IsTest, &l.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *PaymentLinkRepository) Update(id int64, merchantID int, name string, amount *float64) error {
	_, err := r.db.Exec(`UPDATE payment_links SET name = $1, amount = $2 WHERE id = $3 AND merchant_id = $4`, name, amount, id, merchantID)
	return err
}

func (r *PaymentLinkRepository) Delete(id int64, merchantID int) error {
	_, err := r.db.Exec(`DELETE FROM payment_links WHERE id = $1 AND merchant_id = $2`, id, merchantID)
	return err
}
