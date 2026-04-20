-- Migration 002: Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id                SERIAL PRIMARY KEY,
    merchant_id      INTEGER NOT NULL REFERENCES merchants(id),
    item_name        TEXT    NOT NULL,
    valor_total      DECIMAL(15,2) NOT NULL,
    valor_liquido    DECIMAL(15,2) NOT NULL,
    taxa             DECIMAL(15,2) NOT NULL,
    status           TEXT    NOT NULL DEFAULT 'pendente',
    metodo_pagamento TEXT    NOT NULL DEFAULT 'N/A',
    asaas_charge_id  TEXT    DEFAULT '',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_asaas_id ON transactions(asaas_charge_id);
