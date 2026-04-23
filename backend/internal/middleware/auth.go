package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gato-gateway/internal/model"
	"github.com/gato-gateway/internal/repository"
	"github.com/golang-jwt/jwt/v5"
)

// RequireAuth valida o JWT e injeta UserContext no contexto da requisição
func RequireAuth(jwtSecret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})
			if err != nil || !token.Valid {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			claims := token.Claims.(jwt.MapClaims)
			ctx := context.WithValue(r.Context(), "user", model.UserContext{
				MerchantID: int(claims["merchant_id"].(float64)),
				Role:       claims["role"].(string),
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole é um filtro que DEVE ser chamado após RequireAuth para garantir cargos
func RequireRole(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userVal := r.Context().Value("user")
			if userVal == nil {
				http.Error(w, "Unauthorized Context", http.StatusUnauthorized)
				return
			}
			user, ok := userVal.(model.UserContext)
			if !ok || user.Role != requiredRole {
				http.Error(w, "Forbidden - Permissão Insuficiente", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RequireAPIKey valida a chave a2p_live_... ou a2p_test_... e injeta UserContext no contexto
func RequireAPIKey(userRepo *repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			apiKey := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if !strings.HasPrefix(apiKey, "a2p_") {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "API Key inválida. Use o padrão a2p_live_... ou a2p_test_...",
				})
				return
			}
			merchantID, caps, isSandbox, err := userRepo.GetByAPIKey(apiKey)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "API Key não encontrada ou inativa"})
				return
			}
			ctx := context.WithValue(r.Context(), "user", model.UserContext{
				MerchantID: merchantID, Role: "lojista", APICapabilities: caps, IsSandbox: isSandbox,
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
