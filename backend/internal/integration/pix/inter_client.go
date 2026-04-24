package pix

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// InterClient implementa a integração com a API de PIX do Banco Inter
type InterClient struct {
	clientID     string
	clientSecret string
	certContent  string
	keyContent   string
	pixKey       string
	baseURL      string
	httpClient   *http.Client
	token        string
	tokenExp     time.Time
}

// NewInterClient cria um novo cliente para o Banco Inter
func NewInterClient(clientID, clientSecret, cert, key, pixKey, baseURL string) (*InterClient, error) {
	// Se não houver baseURL, usa o sandbox por padrão
	if baseURL == "" {
		baseURL = "https://cdpj-sandbox.inter.co"
	}

	client := &InterClient{
		clientID:     clientID,
		clientSecret: clientSecret,
		certContent:  cert,
		keyContent:   key,
		pixKey:       pixKey,
		baseURL:      baseURL,
	}

	// Configura mTLS se os certificados estiverem presentes
	if cert != "" && key != "" {
		certificate, err := tls.X509KeyPair([]byte(cert), []byte(key))
		if err != nil {
			return nil, fmt.Errorf("erro ao carregar certificados Inter: %w", err)
		}

		client.httpClient = &http.Client{
			Timeout: 20 * time.Second,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					Certificates: []tls.Certificate{certificate},
				},
			},
		}
	} else {
		// Modo sem certificado (apenas para simulação ou se o Inter mudar o padrão)
		client.httpClient = &http.Client{Timeout: 20 * time.Second}
	}

	return client, nil
}

// authenticate obtém o token OAuth2 do Banco Inter
func (c *InterClient) authenticate() error {
	if c.token != "" && time.Now().Before(c.tokenExp) {
		return nil
	}

	data := "client_id=" + c.clientID + "&client_secret=" + c.clientSecret + "&scope=pix.read%20pix.write&grant_type=client_credentials"
	req, err := http.NewRequest("POST", c.baseURL+"/oauth/v2/token", bytes.NewBufferString(data))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro na autenticação Inter: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("erro autenticação Inter status %d: %s", resp.StatusCode, string(body))
	}

	var res struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return err
	}

	c.token = res.AccessToken
	c.tokenExp = time.Now().Add(time.Duration(res.ExpiresIn-60) * time.Second)
	return nil
}

// CreatePixCharge cria uma cobrança imediata (cob) no Banco Inter
func (c *InterClient) CreatePixCharge(customerID string, valor float64, descricao string) (string, error) {
	if err := c.authenticate(); err != nil {
		return "", err
	}

	payload := map[string]interface{}{
		"calendario": map[string]interface{}{
			"expiracao": 3600,
		},
		"valor": map[string]interface{}{
			"original": fmt.Sprintf("%.2f", valor),
		},
		"chave": c.pixKey,
		"solicitacaoPagador": descricao,
	}

	// Se tivermos dados do cliente (CPF/Nome), poderíamos adicionar o objeto "devedor" aqui
	// No Inter, o devedor é opcional na criação da cobrança imediata (cob)

	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", c.baseURL+"/pix/v2/cob", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("inter CreatePixCharge status %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Txid string `json:"txid"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	
	return result.Txid, nil
}

// CreateCustomer no Inter é opcional ou não existe da mesma forma que no Asaas
// Vamos apenas retornar o CPF como ID para manter a compatibilidade
func (c *InterClient) CreateCustomer(name, email, cpfCnpj string) (string, error) {
	return cpfCnpj, nil
}

// GetPixQRCode obtém a imagem e o payload do QR Code
func (c *InterClient) GetPixQRCode(txid string) (*PixQRCode, error) {
	if err := c.authenticate(); err != nil {
		return nil, err
	}

	req, err := http.NewRequest("GET", c.baseURL+"/pix/v2/cob/"+txid+"/qrcode", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var res struct {
		QRCode      string `json:"imagemQrcode"`
		Payload     string `json:"qrcode"`
	}
	json.NewDecoder(resp.Body).Decode(&res)

	return &PixQRCode{
		EncodedImage: res.QRCode,
		Payload:      res.Payload,
	}, nil
}
