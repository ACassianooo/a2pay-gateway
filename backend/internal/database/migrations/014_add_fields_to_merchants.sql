-- Migration 014: Adicionar campos document e phone à tabela de merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS phone TEXT;
