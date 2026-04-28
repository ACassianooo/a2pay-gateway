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
		"INSERT INTO customers (id, merchant_id, name, email, cpf, phone) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING",
		c.ID, c.MerchantID, c.Name, c.Email, c.CPF, c.Phone,
	)
	return err
}

func (r *CustomerRepository) GetByMerchant(merchantID int) ([]model.Customer, error) {
	rows, err := r.db.Query(
		"SELECT id, merchant_id, name, email, cpf, phone, created_at FROM customers WHERE merchant_id = $1 ORDER BY created_at DESC",
		merchantID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var customers []model.Customer
	for rows.Next() {
		var c model.Customer
		if err := rows.Scan(&c.ID, &c.MerchantID, &c.Name, &c.Email, &c.CPF, &c.Phone, &c.CreatedAt); err != nil {
			return nil, err
		}
		customers = append(customers, c)
	}
	return customers, nil
}
