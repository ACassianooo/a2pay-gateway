-- Migration 010: Garantir unicidade das chaves de API
ALTER TABLE merchants ADD CONSTRAINT unique_api_key UNIQUE (api_key);
ALTER TABLE merchants ADD CONSTRAINT unique_api_key_test UNIQUE (api_key_test);
