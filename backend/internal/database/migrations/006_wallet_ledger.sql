-- Migration 006: Carteira Segura e Ledger de Auditoria
-- Esta migration cria a infraestrutura para proteção real do saldo dos lojistas.

-- 1. Tabela de Wallets (Saldos Consolidados)
CREATE TABLE IF NOT EXISTS wallets (
    merchant_id INTEGER PRIMARY KEY REFERENCES merchants(id),
    balance     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Ledger (Livro de Registro Imutável)
-- Registra TODA e QUALQUER movimentação de centavos no sistema.
CREATE TABLE IF NOT EXISTS ledger (
    id          SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    type        TEXT NOT NULL, -- 'credit' (entrada), 'debit' (saída)
    amount      DECIMAL(15,2) NOT NULL,
    reference   TEXT NOT NULL, -- Ex: 'payment_123', 'withdrawal_456'
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Withdrawals (Solicitações de Saque)
CREATE TABLE IF NOT EXISTS withdrawals (
    id          SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    amount      DECIMAL(15,2) NOT NULL,
    pix_key     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ledger_merchant ON ledger(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_merchant ON withdrawals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger(reference);

-- Inicializar wallets para lojistas existentes
INSERT INTO wallets (merchant_id, balance)
SELECT id, 0.00 FROM merchants
ON CONFLICT (merchant_id) DO NOTHING;
