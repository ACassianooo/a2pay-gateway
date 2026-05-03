CREATE TABLE IF NOT EXISTS charges (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL,
    customer_email TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(merchant_id) REFERENCES merchants(id)
);
