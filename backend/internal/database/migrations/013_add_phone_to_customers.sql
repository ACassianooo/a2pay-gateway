-- Migration 013: Add phone column to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
