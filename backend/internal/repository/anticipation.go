package repository

import (
	"database/sql"
	"github.com/gato-gateway/internal/model"
)

type AnticipationRepository struct {
	db *sql.DB
}

func NewAnticipationRepository(db *sql.DB) *AnticipationRepository {
	return &AnticipationRepository{db: db}
}

func (r *AnticipationRepository) Create(merchantID int, amountRequested, feeAmount, netAmount float64, isTest bool) (int64, error) {
	var id int64
	err := r.db.QueryRow(`INSERT INTO anticipations (merchant_id, amount_requested, fee_amount, net_amount, status, is_test) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		merchantID, amountRequested, feeAmount, netAmount, "pendente", isTest).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *AnticipationRepository) GetByMerchant(merchantID int, isTest bool) ([]model.Anticipation, error) {
	rows, err := r.db.Query(`SELECT id, merchant_id, amount_requested, fee_amount, net_amount, status, is_test, created_at FROM anticipations WHERE merchant_id = $1 AND is_test = $2 ORDER BY id DESC`, merchantID, isTest)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ants []model.Anticipation
	for rows.Next() {
		var a model.Anticipation
		if err := rows.Scan(&a.ID, &a.MerchantID, &a.AmountRequested, &a.FeeAmount, &a.NetAmount, &a.Status, &a.IsTest, &a.CreatedAt); err == nil {
			ants = append(ants, a)
		}
	}
	return ants, nil
}

func (r *AnticipationRepository) UpdateStatus(id int64, status string) error {
	_, err := r.db.Exec(`UPDATE anticipations SET status = $1 WHERE id = $2`, status, id)
	return err
}
