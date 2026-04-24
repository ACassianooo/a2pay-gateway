-- Migration 009: Tabela de assinaturas (PIX Recorrente)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    customer_id INTEGER REFERENCES customers(id),
    cliente_nome TEXT NOT NULL DEFAULT '',
    cliente_email TEXT NOT NULL,
    cliente_cpf TEXT NOT NULL DEFAULT '',
    plano_nome TEXT NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    intervalo_dias INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'ativa', -- 'ativa', 'atrasada', 'cancelada'
    next_billing_date TIMESTAMP WITH TIME ZONE,
    current_charge_txid TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant_id ON subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
