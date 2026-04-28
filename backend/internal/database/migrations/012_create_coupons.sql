-- Migration 012: Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'fixo' ou 'percentual'
    discount_value DECIMAL(15,2) NOT NULL,
    max_uses INTEGER DEFAULT 0, -- 0 = ilimitado
    used_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo', -- 'ativo' ou 'desativado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(merchant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_merchant_id ON coupons(merchant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
