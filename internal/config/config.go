package config

import (
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AsaasAPIKeyLive  string
	AsaasAPIKeyTest  string
	AsaasBaseURLReal string
	AsaasBaseURLTest string
	JWTSecret        []byte
	AESKey           []byte
	Port             string
	WebhookSecret    string
	DatabaseURL      string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("[CONFIG] .env não encontrado, usando variáveis do sistema")
	}

	asaasLive := os.Getenv("ASAAS_API_KEY_LIVE")
	if asaasLive == "" {
		asaasLive = os.Getenv("ASAAS_API_KEY") // Retrocompatibilidade
	}

	asaasTest := os.Getenv("ASAAS_API_KEY_TEST")
	if asaasTest == "" {
		asaasTest = asaasLive // Fallback se não configurado
	}

	realURL := os.Getenv("ASAAS_BASE_URL_REAL")
	if realURL == "" {
		realURL = "https://www.asaas.com/api/v3"
	}

	testURL := os.Getenv("ASAAS_BASE_URL_TEST")
	if testURL == "" {
		testURL = "https://sandbox.asaas.com/api/v3"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "gato-gateway-super-secret-key"
	}

	aesKeyHex := os.Getenv("AES_KEY")
	if len(aesKeyHex) != 64 {
		return nil, fmt.Errorf("AES_KEY deve ter 64 chars hex (32 bytes = AES-256)")
	}
	aesKey, err := hex.DecodeString(aesKeyHex)
	if err != nil {
		return nil, fmt.Errorf("AES_KEY inválida: %w", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("[CONFIG] Ambiente Live: %s | Sandbox: %s | Porta: %s", realURL, testURL, port)

	return &Config{
		AsaasAPIKeyLive:  asaasLive,
		AsaasAPIKeyTest:  asaasTest,
		AsaasBaseURLReal: realURL,
		AsaasBaseURLTest: testURL,
		JWTSecret:        []byte(jwtSecret),
		AESKey:           aesKey,
		Port:             port,
		WebhookSecret:    os.Getenv("ASAAS_WEBHOOK_SECRET"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
	}, nil
}
