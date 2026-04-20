package config

import (
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AsaasAPIKey   string
	AsaasBaseURL  string
	JWTSecret     []byte
	AESKey        []byte
	Port          string
	WebhookSecret string
	DatabaseURL   string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("[CONFIG] .env não encontrado, usando variáveis do sistema")
	}

	asaasKey := os.Getenv("ASAAS_API_KEY")
	if asaasKey == "" {
		return nil, fmt.Errorf("ASAAS_API_KEY não configurada")
	}

	baseURL := os.Getenv("ASAAS_BASE_URL")
	if baseURL == "" {
		baseURL = "https://sandbox.asaas.com/api/v3"
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

	log.Printf("[CONFIG] Asaas: %s | Porta: %s | AES-256: ativado", baseURL, port)

	return &Config{
		AsaasAPIKey:   asaasKey,
		AsaasBaseURL:  baseURL,
		JWTSecret:     []byte(jwtSecret),
		AESKey:        aesKey,
		Port:          port,
		WebhookSecret: os.Getenv("ASAAS_WEBHOOK_SECRET"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
	}, nil
}
