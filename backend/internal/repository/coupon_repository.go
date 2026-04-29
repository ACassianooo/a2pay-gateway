package repository

import (
	"database/sql"
	"github.com/gato-gateway/internal/model"
)

type CouponRepository struct {
	db *sql.DB
}

func NewCouponRepository(db *sql.DB) *CouponRepository {
	return &CouponRepository{db: db}
}

func (r *CouponRepository) Create(merchantID int, code, discountType string, value float64, maxUses int) error {
	query := `
		INSERT INTO coupons (merchant_id, code, discount_type, discount_value, max_uses)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(query, merchantID, code, discountType, value, maxUses)
	return err
}

func (r *CouponRepository) List(merchantID int) ([]model.Coupon, error) {
	query := `
		SELECT id, merchant_id, code, discount_type, discount_value, max_uses, used_count, status, created_at
		FROM coupons
		WHERE merchant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Coupon
	for rows.Next() {
		var c model.Coupon
		err := rows.Scan(&c.ID, &c.MerchantID, &c.Code, &c.DiscountType, &c.DiscountValue, &c.MaxUses, &c.UsedCount, &c.Status, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *CouponRepository) ToggleStatus(id, merchantID int, status string) error {
	query := `UPDATE coupons SET status = $1 WHERE id = $2 AND merchant_id = $3`
	_, err := r.db.Exec(query, status, id, merchantID)
	return err
}

func (r *CouponRepository) GetByCode(merchantID int, code string) (*model.Coupon, error) {
	query := `
		SELECT id, merchant_id, code, discount_type, discount_value, max_uses, used_count, status, created_at
		FROM coupons
		WHERE merchant_id = $1 AND code = $2
	`
	var c model.Coupon
	err := r.db.QueryRow(query, merchantID, code).Scan(&c.ID, &c.MerchantID, &c.Code, &c.DiscountType, &c.DiscountValue, &c.MaxUses, &c.UsedCount, &c.Status, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
