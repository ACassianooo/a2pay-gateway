// Package repository contém todo o acesso ao banco de dados.
// Regra: nenhuma lógica de negócio aqui — só SQL.
package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gato-gateway/internal/model"
)

// UserRepository acessa dados de merchants/usuários
type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(name, emailEncrypted, passwordHash, baasID, apiKeyLive, apiKeyTest string) (int64, error) {
	var id int64
	err := r.db.QueryRow(
		`INSERT INTO merchants(name, email, password_hash, baas_account_id, role, api_key, api_key_test, created_at)
		 VALUES($1, $2, $3, $4, 'lojista', $5, $6, $7) RETURNING id`,
		name, emailEncrypted, passwordHash, baasID, apiKeyLive, apiKeyTest, time.Now().Format(time.RFC3339),
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("UserRepository.Create: %w", err)
	}
	return id, nil
}

// GetAllForLogin retorna id, email, password_hash e role de todos os merchants
// (necessário porque emails são criptografados e precisamos descriptografar em memória)
func (r *UserRepository) GetAllForLogin() (*sql.Rows, error) {
	return r.db.Query("SELECT id, email, password_hash, role FROM merchants")
}

func (r *UserRepository) GetAPIKey(merchantID int) (string, string, string, error) {
	var live, test, caps string
	err := r.db.QueryRow(`
		SELECT api_key, api_key_test, COALESCE(api_capabilities, 'pix,card') 
		FROM merchants WHERE id = $1`, merchantID).Scan(&live, &test, &caps)
	return live, test, caps, err
}

func (r *UserRepository) SetAPIKeys(merchantID int, live, test, capabilities string) error {
	_, err := r.db.Exec(`
		UPDATE merchants SET api_key = $1, api_key_test = $2, api_capabilities = $3 
		WHERE id = $4`, live, test, capabilities, merchantID)
	return err
}

func (r *UserRepository) GetByAPIKey(apiKey string) (int, string, bool, error) {
	var id int
	var caps string

	// Tenta buscar na live
	err := r.db.QueryRow(
		"SELECT id, COALESCE(api_capabilities, 'pix,card') FROM merchants WHERE api_key = $1 AND role = 'lojista'", apiKey,
	).Scan(&id, &caps)

	if err == nil {
		return id, caps, false, nil
	}

	// Se não achou na live, tenta na sandbox
	err = r.db.QueryRow(
		"SELECT id, COALESCE(api_capabilities, 'pix,card') FROM merchants WHERE api_key_test = $1 AND role = 'lojista'", apiKey,
	).Scan(&id, &caps)

	if err == nil {
		return id, caps, true, nil
	}

	return 0, "", false, err
}

func (r *UserRepository) Delete(merchantID int) error {
	_, err := r.db.Exec("DELETE FROM merchants WHERE id = $1", merchantID)
	return err
}

func (r *UserRepository) GetMasterStats() (float64, []model.EmpresaRow, error) {
	rows, err := r.db.Query(`
		SELECT m.name, COALESCE(SUM(t.valor_total),0), COALESCE(SUM(t.taxa),0)
		FROM merchants m
		LEFT JOIN transactions t ON m.id = t.merchant_id AND t.status = 'pago' AND t.is_test = false
		WHERE m.role != 'master'
		GROUP BY m.id
	`)
	if err != nil {
		return 0, nil, err
	}
	defer rows.Close()

	var lucroTotal float64
	var empresas []model.EmpresaRow
	for rows.Next() {
		var e model.EmpresaRow
		rows.Scan(&e.Nome, &e.VolumeGirado, &e.TaxasCobradas)
		lucroTotal += e.TaxasCobradas
		empresas = append(empresas, e)
	}
	return lucroTotal, empresas, nil
}
