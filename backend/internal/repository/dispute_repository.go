package repository

import (
	"database/sql"
	"github.com/gato-gateway/internal/model"
)

type DisputeRepository struct {
	db *sql.DB
}

func NewDisputeRepository(db *sql.DB) *DisputeRepository {
	return &DisputeRepository{db: db}
}

func (r *DisputeRepository) List(merchantID int, isTest bool) ([]model.Dispute, error) {
	query := `
		SELECT d.id, d.transaction_id, d.merchant_id, d.amount, d.reason, d.status, d.evidence_deadline, d.is_test, d.created_at, d.updated_at
		FROM disputes d
		WHERE d.merchant_id = $1 AND d.is_test = $2
		ORDER BY d.created_at DESC
	`
	rows, err := r.db.Query(query, merchantID, isTest)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var disputes []model.Dispute
	for rows.Next() {
		var d model.Dispute
		err := rows.Scan(&d.ID, &d.TransactionID, &d.MerchantID, &d.Amount, &d.Reason, &d.Status, &d.EvidenceDeadline, &d.IsTest, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, err
		}
		disputes = append(disputes, d)
	}
	return disputes, nil
}

func (r *DisputeRepository) GetByID(id, merchantID int) (*model.Dispute, error) {
	query := `
		SELECT id, transaction_id, merchant_id, amount, reason, status, evidence_deadline, is_test, created_at, updated_at
		FROM disputes
		WHERE id = $1 AND merchant_id = $2
	`
	var d model.Dispute
	err := r.db.QueryRow(query, id, merchantID).Scan(&d.ID, &d.TransactionID, &d.MerchantID, &d.Amount, &d.Reason, &d.Status, &d.EvidenceDeadline, &d.IsTest, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *DisputeRepository) UpdateStatus(id, merchantID int, status string) error {
	query := `UPDATE disputes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND merchant_id = $3`
	_, err := r.db.Exec(query, status, id, merchantID)
	return err
}

// Para mock em sandbox
func (r *DisputeRepository) CreateMock(d model.Dispute) (int, error) {
	var id int
	query := `
		INSERT INTO disputes (transaction_id, merchant_id, amount, reason, status, evidence_deadline, is_test)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	err := r.db.QueryRow(query, d.TransactionID, d.MerchantID, d.Amount, d.Reason, d.Status, d.EvidenceDeadline, d.IsTest).Scan(&id)
	return id, err
}
