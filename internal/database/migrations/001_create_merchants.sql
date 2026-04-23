-- Migration 001: Tabela de merchants (usuários/lojistas) e conta ADM Master
CREATE TABLE IF NOT EXISTS merchants (
    id              SERIAL PRIMARY KEY,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    password_hash   TEXT    NOT NULL,
    baas_account_id TEXT,
    role            TEXT    NOT NULL DEFAULT 'lojista',
    api_key         TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    api_capabilities TEXT    DEFAULT 'pix,card'
);

-- Inserir a conta ADM atual migrada do SQLite para garantir acesso imediato
INSERT INTO merchants (id, name, email, password_hash, baas_account_id, role, api_key, created_at, api_capabilities)
VALUES (
    1, 
    'A2Pay Master', 
    'aes:6fLgRLSY6gX/LqFMgxy7sbRyGOeaznt2YsKnQhwERVGZsfIB/vd4CJQaeV3GnmkrnZw=', 
    '$2a$10$YnI4bhNGZwfKt2RkcrboFOalkdvO/8JUcVwJSuC.NInSBXB6UvOXy', 
    'acc_1776308189562021000', 
    'master', 
    'a2pay_pk_ca719fc9dba49d56a727c5ad6b9bfec2dcfd21ad982c025a', 
    '2026-04-15 23:56:29-03', 
    'pix,card'
) ON CONFLICT (id) DO NOTHING;

-- Ajustar o contador do SERIAL após o insert manual de ID 1
SELECT setval(pg_get_serial_sequence('merchants', 'id'), coalesce(max(id), 1)) FROM merchants;
