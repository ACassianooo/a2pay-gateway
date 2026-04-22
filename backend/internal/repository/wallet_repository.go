package repository

import (
	"database/sql"
	"fmt"

	"github.com/gato-gateway/internal/model"
)

// WalletRepository acessa logs de fraude e gerencia saldos (wallets)
type WalletRepository struct {
	db *sql.DB
}

func NewWalletRepository(db *sql.DB) *WalletRepository {
	return &WalletRepository{db: db}
}

// GetBalance retorna o saldo atual da wallet do lojista
func (r *WalletRepository) GetBalance(merchantID int) (float64, error) {
	var balance float64
	err := r.db.QueryRow("SELECT balance FROM wallets WHERE merchant_id = $1", merchantID).Scan(&balance)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return balance, err
}

// CreditWallet credita um valor na wallet dentro de uma transação.
// Usa SELECT FOR UPDATE para evitar race conditions.
func (r *WalletRepository) CreditWallet(tx *sql.Tx, merchantID int, amount float64, reference string, description string) error {
	// 1. Lock wallet para update
	var currentBalance float64
	err := tx.QueryRow("SELECT balance FROM wallets WHERE merchant_id = $1 FOR UPDATE", merchantID).Scan(&currentBalance)
	if err == sql.ErrNoRows {
		// Cria wallet se não existir (lojista novo)
		_, err = tx.Exec("INSERT INTO wallets(merchant_id, balance) VALUES($1, $2)", merchantID, amount)
	} else if err == nil {
		_, err = tx.Exec("UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE merchant_id = $2", amount, merchantID)
	}

	if err != nil {
		return fmt.Errorf("CreditWallet update: %w", err)
	}

	// 2. Inserir no ledger para auditoria
	_, err = tx.Exec("INSERT INTO ledger(merchant_id, type, amount, reference, description) VALUES($1, 'credit', $2, $3, $4)",
		merchantID, amount, reference, description)
	return err
}

// DebitWallet debita um valor da wallet dentro de uma transação.
func (r *WalletRepository) DebitWallet(tx *sql.Tx, merchantID int, amount float64, reference string, description string) error {
	// 1. Lock wallet para update e verifica saldo
	var currentBalance float64
	err := tx.QueryRow("SELECT balance FROM wallets WHERE merchant_id = $1 FOR UPDATE", merchantID).Scan(&currentBalance)
	if err != nil {
		return fmt.Errorf("DebitWallet balance check: %w", err)
	}

	if currentBalance < amount {
		return fmt.Errorf("saldo insuficiente")
	}

	// 2. Atualiza saldo
	_, err = tx.Exec("UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE merchant_id = $2", amount, merchantID)
	if err != nil {
		return err
	}

	// 3. Inserir no ledger
	_, err = tx.Exec("INSERT INTO ledger(merchant_id, type, amount, reference, description) VALUES($1, 'debit', $2, $3, $4)",
		merchantID, amount, reference, description)
	return err
}

// CreateWithdrawal registra uma solicitação de saque
func (r *WalletRepository) CreateWithdrawal(merchantID int, amount float64, pixKey string) (int64, error) {
	var id int64
	err := r.db.QueryRow(`
        INSERT INTO withdrawals(merchant_id, amount, pix_key, status) 
        VALUES($1, $2, $3, 'pending') RETURNING id`,
		merchantID, amount, pixKey).Scan(&id)
	return id, err
}

// GetWithdrawals lista os saques de um lojista
func (r *WalletRepository) GetWithdrawals(merchantID int) ([]model.Withdrawal, error) {
	rows, err := r.db.Query(`
        SELECT id, merchant_id, amount, pix_key, status, created_at, updated_at 
        FROM withdrawals WHERE merchant_id = $1 ORDER BY created_at DESC`, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Withdrawal
	for rows.Next() {
		var w model.Withdrawal
		rows.Scan(&w.ID, &w.MerchantID, &w.Amount, &w.PixKey, &w.Status, &w.CreatedAt, &w.UpdatedAt)
		list = append(list, w)
	}
	return list, nil
}

func (r *WalletRepository) InsertFraudLog(merchantID, intentID int, ip string, score int, reasons string, bloqueado bool) {
	r.db.Exec(
		"INSERT INTO fraud_logs(merchant_id, intent_id, customer_ip, score, reasons, bloqueado) VALUES($1, $2, $3, $4, $5, $6)",
		merchantID, intentID, ip, score, reasons, bloqueado,
	)
}

func (r *WalletRepository) CountBlockedByIP(ip string) int {
	var count int
	r.db.QueryRow(
		"SELECT COUNT(*) FROM fraud_logs WHERE customer_ip=$1 AND bloqueado=TRUE AND created_at > NOW() - INTERVAL '1 hour'",
		ip,
	).Scan(&count)
	return count
}
