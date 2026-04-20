package repository

import (
	"database/sql"
	"fmt"

	"github.com/gato-gateway/internal/model"
)

// AdminRepository centraliza consultas globais para o painel Master
type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// UserRow representa a visão do master sobre um lojista
type UserRow struct {
	ID            int     `json:"id"`
	Nome          string  `json:"nome"`
	Email         string  `json:"email"`
	APIKey        string  `json:"api_key"`
	Status        string  `json:"status"` // hardcoded "ativo" para já
	VolumeGirado  float64 `json:"volume_girado"`
	TaxasCobradas float64 `json:"taxas_cobradas"`
	Saldo         float64 `json:"saldo"`
	CreatedAt     string  `json:"created_at"`
}

// GetAllUsers retorna todos os lojistas do sistema com suas totalizações
func (r *AdminRepository) GetAllUsers() ([]UserRow, error) {
	rows, err := r.db.Query(`
		SELECT 
			m.id, m.name, m.email, m.api_key, m.created_at,
			COALESCE(SUM(t.valor_total),0) as volume,
			COALESCE(SUM(t.taxa),0) as taxas,
			COALESCE(SUM(t.valor_liquido),0) as saldo
		FROM merchants m
		LEFT JOIN transactions t ON m.id = t.merchant_id AND t.status = 'pago'
		WHERE m.role != 'master'
		GROUP BY m.id
		ORDER BY m.created_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("GetAllUsers: %w", err)
	}
	defer rows.Close()

	var users []UserRow
	for rows.Next() {
		var u UserRow
		err := rows.Scan(&u.ID, &u.Nome, &u.Email, &u.APIKey, &u.CreatedAt, &u.VolumeGirado, &u.TaxasCobradas, &u.Saldo)
		if err != nil {
			return nil, err
		}
		u.Status = "ativo"
		users = append(users, u)
	}
	return users, nil
}

// GlobalTransactionRow estende a transaction normal com o nome do lojista
type GlobalTransactionRow struct {
	model.Transaction
	MerchantName string `json:"merchant_name"`
}

// GetGlobalTransactions busca transações de todo o ecossistema (limite 100 para demo)
func (r *AdminRepository) GetGlobalTransactions() ([]GlobalTransactionRow, error) {
	rows, err := r.db.Query(`
		SELECT 
			t.id, t.merchant_id, m.name, t.item_name, t.valor_total, t.valor_liquido, 
			t.taxa, t.status, t.metodo_pagamento, t.asaas_charge_id, t.created_at
		FROM transactions t
		JOIN merchants m ON t.merchant_id = m.id
		ORDER BY t.created_at DESC
		LIMIT 100
	`)
	if err != nil {
		return nil, fmt.Errorf("GetGlobalTransactions: %w", err)
	}
	defer rows.Close()

	var txs []GlobalTransactionRow
	for rows.Next() {
		var tx GlobalTransactionRow
		err := rows.Scan(
			&tx.ID, &tx.MerchantID, &tx.MerchantName, &tx.ItemName, &tx.ValorTotal,
			&tx.ValorLiquido, &tx.Taxa, &tx.Status, &tx.MetodoPagamento, &tx.AsaasChargeID, &tx.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		txs = append(txs, tx)
	}
	return txs, nil
}

// GetRiskTransactions busca transações com status sensível
func (r *AdminRepository) GetRiskTransactions() ([]GlobalTransactionRow, error) {
	rows, err := r.db.Query(`
		SELECT 
			t.id, t.merchant_id, m.name, t.item_name, t.valor_total, t.valor_liquido, 
			t.taxa, t.status, t.metodo_pagamento, t.asaas_charge_id, t.created_at
		FROM transactions t
		JOIN merchants m ON t.merchant_id = m.id
		WHERE t.status IN ('fraude', 'recusado', 'estornado')
		ORDER BY t.created_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("GetRiskTransactions: %w", err)
	}
	defer rows.Close()

	var txs []GlobalTransactionRow
	for rows.Next() {
		var tx GlobalTransactionRow
		err := rows.Scan(
			&tx.ID, &tx.MerchantID, &tx.MerchantName, &tx.ItemName, &tx.ValorTotal,
			&tx.ValorLiquido, &tx.Taxa, &tx.Status, &tx.MetodoPagamento, &tx.AsaasChargeID, &tx.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		txs = append(txs, tx)
	}
	return txs, nil
}
