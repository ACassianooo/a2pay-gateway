-- Migration 008: Adicionar campo de metadados para itens dinâmicos
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
