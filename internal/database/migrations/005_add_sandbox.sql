-- Migration 005: Suporte para Ambiente Sandbox
-- Adiciona chave de API exclusiva para testes e flag em transações

-- 1. Alterar tabela de lojistas
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS api_key_test TEXT;

-- 2. Atualizar chaves existentes para o novo padrão 'a2p_live_'
UPDATE merchants 
SET api_key = 'a2p_live_' || api_key 
WHERE api_key IS NOT NULL AND NOT starts_with(api_key, 'a2p_');

-- 3. Gerar chaves de teste iniciais para lojistas existentes (usando o mesmo sufixo por enquanto como exemplo)
UPDATE merchants
SET api_key_test = 'a2p_test_' || substring(api_key from 10)
WHERE api_key_test IS NULL;

-- 4. Alterar tabela de transações
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

-- Criar índice para performance em filtros de dashboard
CREATE INDEX IF NOT EXISTS idx_transactions_is_test ON transactions(is_test);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_test ON transactions(merchant_id, is_test);
