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

func (r *ChargeRepository) Create(merchantID int, customerEmail string, amount float64, dueDate string, description string, isTest bool) (int64, error) {
	var id int64
	err := r.db.QueryRow(`INSERT INTO charges (merchant_id, customer_email, amount, due_date, description, status, is_test) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		merchantID, customerEmail, amount, dueDate, description, "pendente", isTest).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *ChargeRepository) GetByMerchant(merchantID int, isTest bool) ([]model.Charge, error) {
	rows, err := r.db.Query(`SELECT id, merchant_id, customer_email, amount, due_date, description, status, is_test, created_at FROM charges WHERE merchant_id = $1 AND is_test = $2 ORDER BY id DESC`, merchantID, isTest)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var charges []model.Charge
	for rows.Next() {
		var c model.Charge
		if err := rows.Scan(&c.ID, &c.MerchantID, &c.CustomerEmail, &c.Amount, &c.DueDate, &c.Description, &c.Status, &c.IsTest, &c.CreatedAt); err == nil {
			charges = append(charges, c)
		}
	}
	return charges, nil
}
