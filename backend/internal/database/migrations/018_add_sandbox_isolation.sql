-- Migration 017: Isolamento Total de Ambiente Sandbox
-- Adiciona a flag is_test em todas as entidades criadas pelo lojista

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE charges ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE anticipations ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE ledger ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

-- Isolamento de Carteira (Wallet)
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_pkey;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE wallets ADD PRIMARY KEY (merchant_id, is_test);

-- Garantir que cada lojista tenha uma carteira de teste
INSERT INTO wallets (merchant_id, is_test, balance)
SELECT id, true, 0.00 FROM merchants
ON CONFLICT (merchant_id, is_test) DO NOTHING;


-- Opcional: Criar índices para performance, pois será muito filtrado
CREATE INDEX IF NOT EXISTS idx_coupons_test ON coupons(merchant_id, is_test);
CREATE INDEX IF NOT EXISTS idx_products_test ON products(merchant_id, is_test);
CREATE INDEX IF NOT EXISTS idx_subs_test ON subscriptions(merchant_id, is_test);
CREATE INDEX IF NOT EXISTS idx_links_test ON payment_links(merchant_id, is_test);
CREATE INDEX IF NOT EXISTS idx_withdrawals_test ON withdrawals(merchant_id, is_test);
CREATE INDEX IF NOT EXISTS idx_customers_test ON customers(merchant_id, is_test);
