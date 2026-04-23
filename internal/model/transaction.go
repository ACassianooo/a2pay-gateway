package model

import "encoding/json"

// Transaction representa uma transação financeira processada pelo gateway
type Transaction struct {
	ID              int     `json:"id"`
	MerchantID      int     `json:"merchant_id"`
	ItemName        string  `json:"item_name"`
	ValorTotal      float64 `json:"valor_total"`
	ValorLiquido    float64 `json:"valor_liquido"`
	Taxa            float64 `json:"taxa,omitempty"`
	Status          string  `json:"status"`
	MetodoPagamento string  `json:"metodo_pagamento"`
	AsaasChargeID   string          `json:"asaas_charge_id,omitempty"`
	CreatedAt       string          `json:"created_at"`
	Metadata        json.RawMessage `json:"metadata,omitempty"`
}

// EmpresaRow é usado no dashboard master para exibir métricas por empresa
type EmpresaRow struct {
	Nome          string  `json:"nome"`
	VolumeGirado  float64 `json:"volume_girado"`
	TaxasCobradas float64 `json:"taxas_cobradas"`
}
