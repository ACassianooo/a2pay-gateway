package worker

import (
	"log"
	"time"

	"github.com/gato-gateway/internal/service"
)

type SubscriptionWorker struct {
	subService *service.SubscriptionService
	isSandbox  bool
}

func NewSubscriptionWorker(subService *service.SubscriptionService, isSandbox bool) *SubscriptionWorker {
	return &SubscriptionWorker{
		subService: subService,
		isSandbox:  isSandbox,
	}
}

// Start roda em background checando assinaturas vencidas a cada 1 hora.
func (w *SubscriptionWorker) Start() {
	go func() {
		log.Println("[Worker] SubscriptionWorker iniciado. Checando a cada 1 hora.")
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		for {
			// Processa imediatamente na inicialização
			w.process()
			<-ticker.C
		}
	}()
}

func (w *SubscriptionWorker) process() {
	err := w.subService.ProcessDueSubscriptions(w.isSandbox)
	if err != nil {
		log.Printf("[Worker] Erro ao processar assinaturas vencidas: %v\n", err)
	}
}
