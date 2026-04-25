package service

import (
	"fmt"
	"time"

	"github.com/gato-gateway/internal/dto"
	"github.com/gato-gateway/internal/repository"
)

type SubscriptionService struct {
	repo     *repository.SubscriptionRepository
	prodRepo *repository.ProductRepository
	pix      *PIXService
}

func NewSubscriptionService(repo *repository.SubscriptionRepository, prodRepo *repository.ProductRepository, pix *PIXService) *SubscriptionService {
	return &SubscriptionService{repo: repo, prodRepo: prodRepo, pix: pix}
}

// CreateSubscription inicia uma nova assinatura e gera a primeira fatura
func (s *SubscriptionService) CreateSubscription(merchantID int, req dto.CreateSubscriptionRequest, isSandbox bool) (*dto.SubscriptionResponse, *PIXResult, error) {
	// Registro Automático de Produto (Plano)
	_ = s.prodRepo.EnsureExists(merchantID, req.PlanoNome, req.Valor, "recorrente")

	// 1. O próximo vencimento será calculado inteligentemente
	var nextBilling time.Time
	if req.IntervaloDias == 30 {
		// Considera exatamente 1 mês (para resolver meses com 28, 29, 31 dias)
		nextBilling = time.Now().AddDate(0, 1, 0)
	} else if req.IntervaloDias == 365 {
		// Considera exatamente 1 ano
		nextBilling = time.Now().AddDate(1, 0, 0)
	} else {
		// Dias exatos
		nextBilling = time.Now().AddDate(0, 0, req.IntervaloDias)
	}

	// 2. Gerar a primeira cobrança usando o PIX Service
	extReq := ExternalPixRequest{
		Valor:         req.Valor,
		Descricao:     fmt.Sprintf("Assinatura: %s", req.PlanoNome),
		CustomerName:  req.ClienteNome,
		CustomerEmail: req.ClienteEmail,
		CustomerCPF:   req.ClienteCPF,
	}

	intentID, pixResult, err := s.pix.ExternalCharge(merchantID, extReq, isSandbox)
	if err != nil {
		return nil, nil, fmt.Errorf("erro ao gerar primeira cobrança PIX: %w", err)
	}

	// 3. Salvar a assinatura no banco de dados
	subID, err := s.repo.Create(merchantID, req, nextBilling, pixResult.ChargeID)
	if err != nil {
		return nil, nil, fmt.Errorf("erro ao salvar assinatura no banco: %w", err)
	}

	resp := &dto.SubscriptionResponse{
		ID:                subID,
		MerchantID:        merchantID,
		ClienteNome:       req.ClienteNome,
		ClienteEmail:      req.ClienteEmail,
		PlanoNome:         req.PlanoNome,
		Valor:             req.Valor,
		Status:            "ativa",
		IntervaloDias:     req.IntervaloDias,
		NextBillingDate:   nextBilling,
		CurrentChargeTxID: pixResult.ChargeID,
		PixCopyPaste:      pixResult.CopaCola,
		PixQRCode:         pixResult.QRCode,
		CreatedAt:         time.Now(),
	}

	// OBS: Não estamos salvando a intentID da transação dentro da subscription por simplicidade,
	// mas a transação foi salva na tabela transactions via ExternalCharge.
	_ = intentID

	return resp, pixResult, nil
}

// ListSubscriptions retorna todas as assinaturas de um lojista
func (s *SubscriptionService) ListSubscriptions(merchantID int) ([]dto.SubscriptionResponse, error) {
	return s.repo.GetByMerchant(merchantID)
}

// ProcessDueSubscriptions é chamado pelo Worker para gerar novas cobranças PIX para assinaturas vencidas
func (s *SubscriptionService) ProcessDueSubscriptions(isSandbox bool) error {
	dueSubs, err := s.repo.GetDueSubscriptions()
	if err != nil {
		return fmt.Errorf("erro ao buscar assinaturas vencidas: %w", err)
	}

	for _, sub := range dueSubs {
		// Gera a nova cobrança
		extReq := ExternalPixRequest{
			Valor:         sub.Valor,
			Descricao:     fmt.Sprintf("Renovação Assinatura: %s", sub.PlanoNome),
			CustomerName:  sub.ClienteNome,
			CustomerEmail: sub.ClienteEmail,
			CustomerCPF:   "24971563792", // ideal seria ter no bd, mockando aqui se não existir
		}

		_, pixResult, err := s.pix.ExternalCharge(sub.MerchantID, extReq, isSandbox)
		if err != nil {
			// Apenas loga o erro e continua para a próxima
			fmt.Printf("[Subscription Worker] Erro ao renovar assinatura %d: %v\n", sub.ID, err)
			continue
		}

		// Atualiza a próxima data de cobrança
		var nextBilling time.Time
		if sub.IntervaloDias == 30 {
			nextBilling = time.Now().AddDate(0, 1, 0)
		} else if sub.IntervaloDias == 365 {
			nextBilling = time.Now().AddDate(1, 0, 0)
		} else {
			nextBilling = time.Now().AddDate(0, 0, sub.IntervaloDias)
		}
		err = s.repo.UpdateNextBilling(sub.ID, nextBilling, pixResult.ChargeID)
		if err != nil {
			fmt.Printf("[Subscription Worker] Erro ao atualizar assinatura %d: %v\n", sub.ID, err)
		} else {
			fmt.Printf("[Subscription Worker] Assinatura %d renovada com sucesso! Novo TXID: %s\n", sub.ID, pixResult.ChargeID)
			// TODO: Aqui é onde poderíamos enviar um e-mail para sub.ClienteEmail com o pixResult.CopaCola
		}
	}

	return nil
}
