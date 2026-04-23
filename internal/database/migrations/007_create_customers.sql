-- Migration 007: Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id            TEXT PRIMARY KEY, -- ID do Asaas (cust_...)
    merchant_id   INTEGER NOT NULL REFERENCES merchants(id),
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL,
    cpf           TEXT    NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email, merchant_id);
