package repository

import (
	"database/sql"
	"time"

	"github.com/gato-gateway/internal/dto"
)

type SubscriptionRepository struct {
	db *sql.DB
}

func NewSubscriptionRepository(db *sql.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

func (r *SubscriptionRepository) Create(merchantID int, req dto.CreateSubscriptionRequest, nextBilling time.Time, txid string) (int, error) {
	var id int
	query := `
		INSERT INTO subscriptions (merchant_id, cliente_nome, cliente_email, cliente_cpf, plano_nome, valor, intervalo_dias, status, next_billing_date, current_charge_txid)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'ativa', $8, $9)
		RETURNING id
	`
	err := r.db.QueryRow(query, merchantID, req.ClienteNome, req.ClienteEmail, req.ClienteCPF, req.PlanoNome, req.Valor, req.IntervaloDias, nextBilling, txid).Scan(&id)
	return id, err
}

func (r *SubscriptionRepository) GetByMerchant(merchantID int) ([]dto.SubscriptionResponse, error) {
	query := `
		SELECT id, merchant_id, cliente_nome, cliente_email, plano_nome, valor, status, intervalo_dias, next_billing_date, current_charge_txid, created_at
		FROM subscriptions
		WHERE merchant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []dto.SubscriptionResponse
	for rows.Next() {
		var s dto.SubscriptionResponse
		if err := rows.Scan(&s.ID, &s.MerchantID, &s.ClienteNome, &s.ClienteEmail, &s.PlanoNome, &s.Valor, &s.Status, &s.IntervaloDias, &s.NextBillingDate, &s.CurrentChargeTxID, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, s)
	}
	return subs, nil
}

// GetDueSubscriptions retorna as assinaturas ativas que precisam ser cobradas (vencimento <= agora)
func (r *SubscriptionRepository) GetDueSubscriptions() ([]dto.SubscriptionResponse, error) {
	query := `
		SELECT id, merchant_id, cliente_nome, cliente_email, plano_nome, valor, status, intervalo_dias, next_billing_date, current_charge_txid, created_at
		FROM subscriptions
		WHERE status = 'ativa' AND next_billing_date <= NOW()
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []dto.SubscriptionResponse
	for rows.Next() {
		var s dto.SubscriptionResponse
		if err := rows.Scan(&s.ID, &s.MerchantID, &s.ClienteNome, &s.ClienteEmail, &s.PlanoNome, &s.Valor, &s.Status, &s.IntervaloDias, &s.NextBillingDate, &s.CurrentChargeTxID, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, s)
	}
	return subs, nil
}

func (r *SubscriptionRepository) UpdateNextBilling(id int, nextBilling time.Time, newTxid string) error {
	query := `UPDATE subscriptions SET next_billing_date = $1, current_charge_txid = $2 WHERE id = $3`
	_, err := r.db.Exec(query, nextBilling, newTxid, id)
	return err
}
