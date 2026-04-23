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

	// ── Serviços ─────────────────────────────────────────────────────────
	cryptoSvc := service.MustNewCryptoService(fmt.Sprintf("%x", cfg.AESKey))

	pixLive := service.NewPixClientAdapter(cfg.AsaasAPIKeyLive, cfg.AsaasBaseURLReal)
	pixTest := service.NewPixClientAdapter(cfg.AsaasAPIKeyTest, cfg.AsaasBaseURLTest)

	walletSvc := service.NewWalletService()
	fraudSvc := service.NewFraudService(txRepo, walRepo)
	pixSvc := service.NewPIXService(pixLive, pixTest, txRepo, custRepo)
	paymentSvc := service.NewPaymentService(txRepo, pixSvc, walletSvc, fraudSvc)

	// ── Handlers ─────────────────────────────────────────────────────────
	authH := handler.NewAuthHandler(userRepo, cryptoSvc, cfg.JWTSecret)
	payH := handler.NewPaymentHandler(paymentSvc, pixSvc, walletSvc, pixLive, pixTest)
	dashH := handler.NewDashboardHandler(userRepo, txRepo, walRepo)
	merchantH := handler.NewMerchantHandler(userRepo, walRepo, db.Conn, cryptoSvc)
	healthH := handler.NewHealthHandler(db)
	webhookH := handler.NewWebhookHandler(txRepo, walRepo, db.Conn, cfg.WebhookSecret)
	adminH := handler.NewAdminHandler(adminRepo)
	custH := handler.NewCustomerHandler(custRepo)

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
	})

	// API interna
	r.Route("/api", func(r chi.Router) {
		r.With(middleware.RateLimiter(10, time.Minute)).Post("/auth/login", authH.Login)
		r.With(middleware.RateLimiter(10, time.Minute)).Post("/auth/register", authH.Register)

		r.Post("/pagamentos/intent", payH.CreateIntent)
		r.Get("/pagamentos/intent/{id}", payH.GetIntent)
		r.Post("/pagamentos/processar", payH.ProcessPayment)
		r.Get("/pagamentos/pix/{charge_id}/qrcode", payH.GetPixQRCode)
		r.Post("/vault/tokenize", payH.TokenizeCard)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(cfg.JWTSecret))
			r.Get("/pagamentos", dashH.Dashboard)
			r.Get("/merchants/apikey", merchantH.GetAPIKey)
			r.Post("/merchants/apikey/rotate", merchantH.RotateAPIKey)
			r.Delete("/merchants/account", merchantH.DeleteAccount)

			// Novas rotas de saque e auditoria financeira
			r.Post("/merchants/withdraw", merchantH.Withdraw)
			r.Get("/merchants/withdrawals", merchantH.GetWithdrawals)
			r.Get("/merchants/customers", custH.GetCustomers)
		})

		// Rotas exclusivas do Master Dashboard
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(cfg.JWTSecret))
			r.Use(middleware.RequireRole("master"))
			
			r.Get("/admin/users", adminH.GetUsers)
			r.Get("/admin/transactions", adminH.GetGlobalTransactions)
			r.Get("/admin/fraud", adminH.GetFraudAlerts)
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
