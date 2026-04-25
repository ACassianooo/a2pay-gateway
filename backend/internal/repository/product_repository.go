package repository

import (
	"database/sql"

	"github.com/gato-gateway/internal/model"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// EnsureExists inserts a new product if it doesn't already exist for this merchant
func (r *ProductRepository) EnsureExists(merchantID int, name string, price float64, cycle string) error {
	if name == "" {
		name = "Produto sem nome"
	}

	query := `
		INSERT INTO products (merchant_id, name, price, cycle)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (merchant_id, name) DO NOTHING
	`
	_, err := r.db.Exec(query, merchantID, name, price, cycle)
	return err
}

// List returns all products for a given merchant
func (r *ProductRepository) List(merchantID int) ([]model.Product, error) {
	query := `
		SELECT id, merchant_id, name, description, price, cycle, image_url, created_at
		FROM products
		WHERE merchant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		var desc, img sql.NullString

		err := rows.Scan(&p.ID, &p.MerchantID, &p.Name, &desc, &p.Price, &p.Cycle, &img, &p.CreatedAt)
		if err != nil {
			return nil, err
		}

		if desc.Valid {
			p.Description = desc.String
		}
		if img.Valid {
			p.ImageURL = img.String
		}

		products = append(products, p)
	}
	return products, nil
}
