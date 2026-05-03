package model

type Charge struct {
	ID            int     `json:"id"`
	MerchantID    int     `json:"merchant_id"`
	CustomerEmail string  `json:"customer_email"`
	Amount        float64 `json:"amount"`
	DueDate       string  `json:"due_date"`
	Description   string  `json:"description"`
	Status        string  `json:"status"`
	IsTest        bool    `json:"is_test"`
	CreatedAt     string  `json:"created_at"`
}
