package service

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"log"
	"strings"
	"sync"
)

// CryptoService gerencia criptografia AES-256-GCM
type CryptoService struct{ aesKey []byte }

func NewCryptoService(aesKeyHex string) (*CryptoService, error) {
	key, err := hex.DecodeString(aesKeyHex)
	if err != nil {
		return nil, fmt.Errorf("AES_KEY inválida: %w", err)
	}
	return &CryptoService{aesKey: key}, nil
}

// MustNewCryptoService — versão que faz fatal se a chave for inválida
func MustNewCryptoService(aesKeyHex string) *CryptoService {
	s, err := NewCryptoService(aesKeyHex)
	if err != nil {
		log.Fatalf("[CRYPTO] %v", err)
	}
	return s
}

func (c *CryptoService) Encrypt(plaintext string) string {
	if len(c.aesKey) == 0 || plaintext == "" {
		return plaintext
	}
	block, _ := aes.NewCipher(c.aesKey)
	gcm, _   := cipher.NewGCM(block)
	nonce    := make([]byte, gcm.NonceSize())
	rand.Read(nonce)
	ct := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return "aes:" + base64.StdEncoding.EncodeToString(ct)
}

func (c *CryptoService) Decrypt(encoded string) string {
	if !strings.HasPrefix(encoded, "aes:") || len(c.aesKey) == 0 {
		return encoded
	}
	data, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(encoded, "aes:"))
	if err != nil {
		return encoded
	}
	block, _ := aes.NewCipher(c.aesKey)
	gcm, _   := cipher.NewGCM(block)
	ns       := gcm.NonceSize()
	if len(data) < ns {
		return encoded
	}
	pt, err := gcm.Open(nil, data[:ns], data[ns:], nil)
	if err != nil {
		return encoded
	}
	return string(pt)
}

func GenerateAPIKey() string {
	b := make([]byte, 24)
	rand.Read(b)
	return "gato_pk_" + hex.EncodeToString(b)
}

// WalletService vault de tokenização de cartões (em memória, thread-safe)
type WalletService struct {
	mu    sync.RWMutex
	vault map[string]string
}

func NewWalletService() *WalletService {
	return &WalletService{vault: make(map[string]string)}
}

func (w *WalletService) Tokenize(cardNumber, _, _ string) string {
	w.mu.Lock()
	defer w.mu.Unlock()
	token := fmt.Sprintf("gato_tk_%d", len(w.vault)+1)
	w.vault[token] = cardNumber
	prefix := cardNumber
	if len(cardNumber) > 4 {
		prefix = cardNumber[:4]
	}
	log.Printf("[VAULT] %s...****  →  %s", prefix, token)
	return token
}

func (w *WalletService) Resolve(token string) (string, error) {
	if !strings.HasPrefix(token, "gato_tk_") {
		return "", fmt.Errorf("token inválido: deve começar com gato_tk_")
	}
	w.mu.RLock()
	defer w.mu.RUnlock()
	card, ok := w.vault[token]
	if !ok {
		return "", fmt.Errorf("token de cartão inválido ou expirado")
	}
	return card, nil
}
