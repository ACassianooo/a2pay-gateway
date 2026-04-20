package repository

import "database/sql"

// WalletRepository acessa logs de fraude (auditoria do antifraude)
type WalletRepository struct {
	db *sql.DB
}

func NewWalletRepository(db *sql.DB) *WalletRepository {
	return &WalletRepository{db: db}
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
