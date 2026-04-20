// Package utils fornece helpers reutilizáveis sem dependências internas.
package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

// NewID gera um ID único no formato prefix_<hex>
// Exemplo: tx_a3f2b1...
func NewID(prefix string) string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(b))
}

// Now retorna o tempo atual já formatado para ISO 8601
func Now() string {
	return time.Now().Format(time.RFC3339)
}

// BrazilTime retorna o horário atual no formato brasileiro
func BrazilTime() string {
	loc, _ := time.LoadLocation("America/Sao_Paulo")
	return time.Now().In(loc).Format("02/01/2006 15:04:05")
}

// DateForAsaas retorna a data de hoje + N dias no formato exigido pelo Asaas (YYYY-MM-DD)
func DateForAsaas(plusDays int) string {
	return time.Now().Add(time.Duration(plusDays) * 24 * time.Hour).Format("2006-01-02")
}
