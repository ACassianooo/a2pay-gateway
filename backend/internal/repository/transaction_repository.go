package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gato-gateway/internal/model"
)

// TransactionRepository acessa dados de transações
type TransactionRepository struct {
	db *sql.DB
}

func NewTransactionRepository(db *sql.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) Create(merchantID int, itemName string, valorTotal, liquido, taxa float64, isTest bool, metadata []byte) (int64, error) {
	var id int64
	err := r.db.QueryRow(
		`INSERT INTO transactions(merchant_id, item_name, valor_total, valor_liquido, taxa, status, metodo_pagamento, asaas_charge_id, created_at, is_test, metadata)
		 VALUES($1, $2, $3, $4, $5, 'pendente', 'N/A', '', $6, $7, $8) RETURNING id`,
		merchantID, itemName, valorTotal, liquido, taxa, time.Now().Format(time.RFC3339), isTest, metadata,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("TransactionRepository.Create: %w", err)
	}
	return id, nil
}

func (r *TransactionRepository) GetByID(id int) (float64, int, bool, string, []byte, error) {
	var valor float64
	var merchantID int
	var isTest bool
	var status string
	var metadata []byte
	err := r.db.QueryRow(
		"SELECT valor_total, merchant_id, is_test, status, metadata FROM transactions WHERE id = $1", id,
	).Scan(&valor, &merchantID, &isTest, &status, &metadata)
	return valor, merchantID, isTest, status, metadata, err
}

func (r *TransactionRepository) GetItemName(id int) string {
	var name string
	r.db.QueryRow("SELECT item_name FROM transactions WHERE id = $1", id).Scan(&name)
	return name
}

func (r *TransactionRepository) SetChargeID(intentID int64, chargeID string) {
	r.db.Exec("UPDATE transactions SET asaas_charge_id = $1 WHERE id = $2", chargeID, intentID)
}

func (r *TransactionRepository) UpdateToPago(id int, metodo string, taxa, liquido float64) error {
	_, err := r.db.Exec(
		"UPDATE transactions SET status='pago', metodo_pagamento=$1, taxa=$2, valor_liquido=$3 WHERE id=$4",
		metodo, taxa, liquido, id,
	)
	return err
}

func (r *TransactionRepository) UpdateToAguardandoPIX(id int, taxa, liquido float64, chargeID string) error {
	_, err := r.db.Exec(
		"UPDATE transactions SET status='aguardando_pix', metodo_pagamento='pix', taxa=$1, valor_liquido=$2, asaas_charge_id=$3 WHERE id=$4",
		taxa, liquido, chargeID, id,
	)
	return err
}

func (r *TransactionRepository) ConfirmPIX(chargeID string) error {
	_, err := r.db.Exec(
		"UPDATE transactions SET status='pago' WHERE asaas_charge_id=$1 AND status='aguardando_pix'",
		chargeID,
	)
	return err
}

func (r *TransactionRepository) GetByMerchant(merchantID int, isTest bool) ([]model.Transaction, float64, error) {
	rows, err := r.db.Query(
		`SELECT id, merchant_id, item_name, valor_total, valor_liquido, status, metodo_pagamento, created_at
		 FROM transactions WHERE merchant_id = $1 AND is_test = $2 ORDER BY created_at DESC`,
		merchantID, isTest,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var txs []model.Transaction
	var saldo float64
	for rows.Next() {
		var t model.Transaction
		rows.Scan(&t.ID, &t.MerchantID, &t.ItemName, &t.ValorTotal, &t.ValorLiquido, &t.Status, &t.MetodoPagamento, &t.CreatedAt)
		txs = append(txs, t)
		if t.Status == "pago" {
			saldo += t.ValorLiquido
		}
	}
	return txs, saldo, nil
}

func (r *TransactionRepository) DeleteByMerchant(merchantID int) error {
	_, err := r.db.Exec("DELETE FROM transactions WHERE merchant_id = $1", merchantID)
	return err
}

// ── Queries para antifraude ───────────────────────────────────────────────────

func (r *TransactionRepository) CountRecentByMerchant(merchantID int) int {
	var count int
	r.db.QueryRow(
		"SELECT COUNT(*) FROM transactions WHERE merchant_id=$1 AND created_at > NOW() - INTERVAL '5 minutes'",
		merchantID,
	).Scan(&count)
	return count
}

func (r *TransactionRepository) GetAvgValue(merchantID int) (float64, int) {
	var avg sql.NullFloat64
	var total int
	r.db.QueryRow(
		"SELECT AVG(valor_total), COUNT(*) FROM transactions WHERE merchant_id=$1 AND status IN ('pago','aguardando_pix')",
		merchantID,
	).Scan(&avg, &total)
	return avg.Float64, total
}

func (r *TransactionRepository) GetInfoByChargeID(chargeID string) (merchantID int, liquido float64, taxa float64, isTest bool, status string, err error) {
	err = r.db.QueryRow(`
		SELECT merchant_id, valor_liquido, taxa, is_test, status 
		FROM transactions WHERE asaas_charge_id = $1`, chargeID).
		Scan(&merchantID, &liquido, &taxa, &isTest, &status)
	return
}
