// Package server configura e inicializa o servidor HTTP.
// Tudo que antes estava no main.go agora vive aqui: rotas, middlewares e CORS.
package server

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/gato-gateway/internal/config"
	"github.com/gato-gateway/internal/database"
	"github.com/gato-gateway/internal/handler"
	"github.com/gato-gateway/internal/middleware"
	"github.com/gato-gateway/internal/repository"
	"github.com/gato-gateway/internal/service"
	"github.com/gato-gateway/internal/integration/pix"
	"github.com/gato-gateway/internal/worker"
)

// Server encapsula o roteador e todas as dependências
type Server struct {
	cfg    *config.Config
	db     *database.DB
	router http.Handler
}

// New monta todas as dependências e configura o roteador
func New(cfg *config.Config, db *database.DB) *Server {
	// ── Repositórios ────────────────────────────────────────────────────
	userRepo := repository.NewUserRepository(db.Conn)
	txRepo   := repository.NewTransactionRepository(db.Conn)
	walRepo  := repository.NewWalletRepository(db.Conn)
	adminRepo := repository.NewAdminRepository(db.Conn)
	custRepo := repository.NewCustomerRepository(db.Conn)

	subRepo := repository.NewSubscriptionRepository(db.Conn)
	prodRepo := repository.NewProductRepository(db.Conn)
	couRepo := repository.NewCouponRepository(db.Conn)
	chargeRepo := repository.NewChargeRepository(db.Conn)
	antRepo := repository.NewAnticipationRepository(db.Conn)
	payLinkRepo := repository.NewPaymentLinkRepository(db.Conn)
	// ── Serviços ─────────────────────────────────────────────────────────
	cryptoSvc := service.MustNewCryptoService(fmt.Sprintf("%x", cfg.AESKey))

	// Inicializa Banco Inter (Prioridade Total)
	var pixInterLive, pixInterTest *pix.InterClient
	
	// Tentamos carregar as credenciais (seja live ou test)
	if cfg.InterClientID != "" {
		// No futuro, podemos separar INTER_URL_LIVE e INTER_URL_SANDBOX
		// Por enquanto, usamos as credenciais fornecidas para ambos
		pixInterLive, _ = pix.NewInterClient(
			cfg.InterClientID,
			cfg.InterClientSecret,
			cfg.InterCertContent,
			cfg.InterKeyContent,
			cfg.InterPixKey,
			"https://cdpj.inter.co", // URL de Produção
		)
		pixInterTest, _ = pix.NewInterClient(
			cfg.InterClientID,
			cfg.InterClientSecret,
			cfg.InterCertContent,
			cfg.InterKeyContent,
			cfg.InterPixKey,
			"https://cdpj-sandbox.inter.co", // URL de Sandbox
		)
	}

	// Adaptadores para o Service (Inter com Fallback para Asaas)
	var pixLive, pixTest *service.PixClientAdapter
	if pixInterLive != nil {
		pixLive = service.NewPixClientAdapter(pixInterLive)
	} else if cfg.AsaasAPIKeyLive != "" {
		asaasLive := pix.NewClient(cfg.AsaasAPIKeyLive, cfg.AsaasBaseURLReal)
		pixLive = service.NewPixClientAdapter(asaasLive)
	}

	if pixInterTest != nil {
		pixTest = service.NewPixClientAdapter(pixInterTest)
	} else if cfg.AsaasAPIKeyTest != "" {
		asaasTest := pix.NewClient(cfg.AsaasAPIKeyTest, cfg.AsaasBaseURLTest)
		pixTest = service.NewPixClientAdapter(asaasTest)
	}

	walletSvc := service.NewWalletService()
	fraudSvc := service.NewFraudService(txRepo, walRepo)
	pixSvc := service.NewPIXService(pixLive, pixTest, txRepo, custRepo)
	paymentSvc := service.NewPaymentService(txRepo, prodRepo, pixSvc, walletSvc, fraudSvc)
	subSvc := service.NewSubscriptionService(subRepo, prodRepo, couRepo, pixSvc)

	// Inicia o Worker de Assinaturas em Background (roda uma vez por hora)
	// OBS: Em Produção, você pode querer passar isSandbox=false ou puxar da configuração.
	// Por enquanto, usaremos false.
	subWorker := worker.NewSubscriptionWorker(subSvc, false)
	subWorker.Start()

	// ── Handlers ─────────────────────────────────────────────────────────
	authH := handler.NewAuthHandler(userRepo, cryptoSvc, cfg.JWTSecret)
	payH := handler.NewPaymentHandler(paymentSvc, pixSvc, walletSvc, pixLive, pixTest)
	dashH := handler.NewDashboardHandler(userRepo, txRepo, walRepo)
	merchantH := handler.NewMerchantHandler(userRepo, walRepo, prodRepo, couRepo, db.Conn, cryptoSvc)
	healthH := handler.NewHealthHandler(db)
	webhookH := handler.NewWebhookHandler(txRepo, walRepo, db.Conn, cfg.WebhookSecret)
	adminH := handler.NewAdminHandler(adminRepo)
	custH := handler.NewCustomerHandler(custRepo)
	subH := handler.NewSubscriptionHandler(subSvc)
	chargeH := handler.NewChargeHandler(chargeRepo)
	antH := handler.NewAnticipationHandler(antRepo, walRepo)
	payLinkH := handler.NewPaymentLinkHandler(payLinkRepo)

	// ── Router ───────────────────────────────────────────────────────────
	r := chi.NewRouter()
	r.Use(chiMiddleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173", "https://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "x-a2pay-env"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check (sem auth)
	r.Get("/health", healthH.Check)

	// Webhook Asaas (sem JWT, mas com token de segurança próprio)
	r.Post("/webhooks/asaas", webhookH.Handle)

	// API pública via API Key (integração externa de lojistas)
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(middleware.RateLimiter(60, time.Minute))
		r.Use(middleware.RequireAPIKey(userRepo))
		r.Post("/pix", payH.ExternalPixCharge)
		r.Post("/subscriptions", subH.Create) // Rota pública de assinaturas
	})

	// API interna
	r.Route("/api", func(r chi.Router) {
		r.With(middleware.RateLimiter(10, time.Minute)).Post("/auth/login", authH.Login)
		r.With(middleware.RateLimiter(10, time.Minute)).Post("/auth/register", authH.Register)

		r.Post("/pagamentos/intent", payH.CreateIntent)
		r.Get("/pagamentos/intent/{id}", payH.GetIntent)
		r.Get("/pagamentos/link-info/{id}", payLinkH.GetByHash)
		r.Post("/pagamentos/processar", payH.ProcessPayment)
		r.Get("/pagamentos/pix/{charge_id}/qrcode", payH.GetPixQRCode)
		r.Post("/vault/tokenize", payH.TokenizeCard)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(cfg.JWTSecret))
			r.Get("/pagamentos", dashH.Dashboard)
			r.Get("/merchants/apikey", merchantH.GetAPIKey)
			r.Post("/merchants/apikey/rotate", merchantH.RotateAPIKey)
			r.Delete("/merchants/apikey", merchantH.DeleteAPIKey)
			r.Delete("/merchants/account", merchantH.DeleteAccount)

			r.Get("/merchants/products", merchantH.GetProducts)
			r.Post("/merchants/products", merchantH.CreateProduct)
			r.Put("/merchants/products", merchantH.UpdateProduct)
			r.Delete("/merchants/products/{id}", merchantH.DeleteProduct)

			r.Get("/merchants/coupons", merchantH.GetCoupons)
			r.Post("/merchants/coupons", merchantH.CreateCoupon)
			r.Put("/merchants/coupons", merchantH.UpdateCoupon)
			r.Delete("/merchants/coupons/{id}", merchantH.DeleteCoupon)
			r.Post("/merchants/coupons/toggle", merchantH.ToggleCouponStatus)

			// Novas rotas de saque e auditoria financeira
			r.Post("/merchants/withdraw", merchantH.Withdraw)
			r.Get("/merchants/withdrawals", merchantH.GetWithdrawals)
			r.Get("/merchants/customers", custH.GetCustomers)
			r.Post("/merchants/customers", custH.PostCreateCustomer)
			r.Put("/merchants/customers", custH.Update)
			r.Delete("/merchants/customers/{id}", custH.Delete)

			// Rotas de Assinaturas
			r.Post("/subscriptions", subH.Create)
			r.Get("/subscriptions", subH.List)

			// Cobranças e Antecipações
			r.Post("/merchants/charges", chargeH.Create)
			r.Get("/merchants/charges", chargeH.List)
			r.Post("/merchants/anticipations", antH.Create)
			r.Get("/merchants/anticipations", antH.List)

			// Links de Pagamento
			r.Post("/merchants/payment-links", payLinkH.Create)
			r.Get("/merchants/payment-links", payLinkH.List)
			r.Put("/merchants/payment-links/{id}", payLinkH.Update)
			r.Delete("/merchants/payment-links/{id}", payLinkH.Delete)
		})

		// Rotas exclusivas do Master Dashboard
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(cfg.JWTSecret))
			r.Use(middleware.RequireRole("master"))
			
			r.Get("/admin/users", adminH.GetUsers)
			r.Get("/admin/transactions", adminH.GetGlobalTransactions)
			r.Get("/admin/fraud", adminH.GetFraudAlerts)
			r.Get("/admin/withdrawals", adminH.GetWithdrawals)
			r.Post("/admin/withdrawals/approve", adminH.ApproveWithdrawal)
		})
	})

	return &Server{cfg: cfg, db: db, router: r}
}

// Start inicia o servidor na porta configurada
func (s *Server) Start(addr string) error {
	fmt.Printf("\n🚀 A2Pay Gateway  →  http://localhost%s\n", addr)
	fmt.Printf("   Health check  →  http://localhost%s/health\n\n", addr)
	log.Printf("[SERVER] Escutando em %s", addr)
	return http.ListenAndServe(addr, s.router)
}

// Handler retorna o roteador para uso em Serverless Functions (ex: Vercel)
func (s *Server) Handler() http.Handler {
	return s.router
}
