-- 019_create_disputes.sql
CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id),
    merchant_id INT REFERENCES merchants(id),
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'aberta', -- aberta, em_revisao, ganha, perdida, encerrada
    evidence_deadline TIMESTAMP,
    is_test BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_merchant ON disputes(merchant_id);
CREATE INDEX idx_disputes_status ON disputes(status);
