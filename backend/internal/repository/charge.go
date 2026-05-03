package repository

import (
	"database/sql"
	"github.com/gato-gateway/internal/model"
)

type ChargeRepository struct {
	db *sql.DB
}

func NewChargeRepository(db *sql.DB) *ChargeRepository {
	return &ChargeRepository{db: db}
}

func (r *ChargeRepository) Create(merchantID int, customerEmail string, amount float64, dueDate string, description string) (int64, error) {
	var id int64
	err := r.db.QueryRow(`INSERT INTO charges (merchant_id, customer_email, amount, due_date, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		merchantID, customerEmail, amount, dueDate, description, "pendente").Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *ChargeRepository) GetByMerchant(merchantID int) ([]model.Charge, error) {
	rows, err := r.db.Query(`SELECT id, merchant_id, customer_email, amount, due_date, description, status, created_at FROM charges WHERE merchant_id = $1 ORDER BY id DESC`, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var charges []model.Charge
	for rows.Next() {
		var c model.Charge
		if err := rows.Scan(&c.ID, &c.MerchantID, &c.CustomerEmail, &c.Amount, &c.DueDate, &c.Description, &c.Status, &c.CreatedAt); err == nil {
			charges = append(charges, c)
		}
	}
	return charges, nil
}
