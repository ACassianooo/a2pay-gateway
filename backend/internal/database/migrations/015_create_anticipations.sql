CREATE TABLE IF NOT EXISTS anticipations (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL,
    amount_requested REAL NOT NULL,
    fee_amount REAL NOT NULL,
    net_amount REAL NOT NULL,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(merchant_id) REFERENCES merchants(id)
);
