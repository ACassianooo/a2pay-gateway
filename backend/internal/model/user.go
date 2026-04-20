package model

// User representa um merchant (lojista ou master) no sistema
type User struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Email          string `json:"email"`
	PasswordHash   string `json:"-"`
	BaasAccountID  string `json:"baas_account_id,omitempty"`
	Role           string `json:"role"`
	APIKey         string `json:"api_key,omitempty"`
	CreatedAt      string `json:"created_at,omitempty"`
}

// UserContext é injetado no contexto HTTP após autenticação bem-sucedida
type UserContext struct {
	MerchantID      int
	Role            string
	APICapabilities string // ex: "pix" ou "pix,card"
}
