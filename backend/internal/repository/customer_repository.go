package repository

import (
	"database/sql"
	"github.com/gato-gateway/internal/model"
)

type CustomerRepository struct {
	db *sql.DB
}

func NewCustomerRepository(db *sql.DB) *CustomerRepository {
	return &CustomerRepository{db: db}
}

func (r *CustomerRepository) Create(c model.Customer) error {
	_, err := r.db.Exec(
		"INSERT INTO customers (id, merchant_id, name, email, cpf, phone, is_test) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING",
		c.ID, c.MerchantID, c.Name, c.Email, c.CPF, c.Phone, c.IsTest,
	)
	return err
}

func (r *CustomerRepository) GetByMerchant(merchantID int, isTest bool) ([]model.Customer, error) {
	rows, err := r.db.Query(
		"SELECT id, merchant_id, name, email, cpf, phone, is_test, created_at FROM customers WHERE merchant_id = $1 AND is_test = $2 ORDER BY created_at DESC",
		merchantID, isTest,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var customers []model.Customer
	for rows.Next() {
		var c model.Customer
		if err := rows.Scan(&c.ID, &c.MerchantID, &c.Name, &c.Email, &c.CPF, &c.Phone, &c.IsTest, &c.CreatedAt); err != nil {
			return nil, err
		}
		customers = append(customers, c)
	}
	return customers, nil
}

func (r *CustomerRepository) Update(id string, merchantID int, name, email, cpf, phone string) error {
	_, err := r.db.Exec(
		"UPDATE customers SET name = $1, email = $2, cpf = $3, phone = $4 WHERE id = $5 AND merchant_id = $6",
		name, email, cpf, phone, id, merchantID,
	)
	return err
}

func (r *CustomerRepository) Delete(id string, merchantID int) error {
	_, err := r.db.Exec("DELETE FROM customers WHERE id = $1 AND merchant_id = $2", id, merchantID)
	return err
}
