-- Migration 011: Create products table and ensure image_url column
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cycle VARCHAR(50) DEFAULT 'uma_vez',
    image_url TEXT, -- TEXT instead of VARCHAR to support Base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(merchant_id, name)
);

-- Se a tabela já existir, garantimos que image_url seja TEXT
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
        ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
    ELSE
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;
