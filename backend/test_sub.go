package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

func generateCPF() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	n := make([]int, 9)
	for i := 0; i < 9; i++ {
		n[i] = r.Intn(10)
	}
	d1 := 0
	for i, v := range n {
		d1 += v * (10 - i)
	}
	d1 = 11 - (d1 % 11)
	if d1 >= 10 {
		d1 = 0
	}
	d2 := 0
	for i, v := range n {
		d2 += v * (11 - i)
	}
	d2 += d1 * 2
	d2 = 11 - (d2 % 11)
	if d2 >= 10 {
		d2 = 0
	}
	return fmt.Sprintf("%d%d%d%d%d%d%d%d%d%d%d", n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], d1, d2)
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://postgres.wozbuvbhmtkgexayznnq:VK210EAPqOlT2PAT@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"
	}
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	var apiKeyTest string
	db.QueryRow("SELECT api_key_test FROM merchants WHERE role = 'lojista' AND api_key_test IS NOT NULL LIMIT 1").Scan(&apiKeyTest)

	payload := map[string]interface{}{
		"cliente_nome":  "Teste Assinatura",
		"cliente_email": fmt.Sprintf("teste%d@assinatura.com", time.Now().Unix()),
		"cliente_cpf":   generateCPF(),
		"plano_nome":    "Plano Mensal",
		"valor":         50.00,
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "http://localhost:8080/api/v1/subscriptions", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKeyTest)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal("API Request failed:", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\nBody: %s\n", resp.StatusCode, string(respBody))
}
