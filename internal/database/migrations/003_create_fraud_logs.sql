-- Migration 003: Tabela de logs do antifraude
CREATE TABLE IF NOT EXISTS fraud_logs (
    id          SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    intent_id   INTEGER NOT NULL,
    customer_ip TEXT,
    score       INTEGER,
    reasons     TEXT,
    bloqueado   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
