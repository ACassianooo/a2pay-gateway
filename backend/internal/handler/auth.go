package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gato-gateway/internal/dto"
	"github.com/gato-gateway/internal/repository"
	"github.com/gato-gateway/internal/service"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler gerencia registro e login de merchants
type AuthHandler struct {
	userRepo  *repository.UserRepository
	crypto    *service.CryptoService
	jwtSecret []byte
}

func NewAuthHandler(userRepo *repository.UserRepository, crypto *service.CryptoService, jwtSecret []byte) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, crypto: crypto, jwtSecret: jwtSecret}
}

// Register — POST /api/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	baasID := fmt.Sprintf("acc_%d", time.Now().UnixNano())
	apiKeyLive := service.GenerateAPIKey("a2p_live_")
	apiKeyTest := service.GenerateAPIKey("a2p_test_")

	id, err := h.userRepo.Create(req.Name, h.crypto.Encrypt(req.Email), string(hash), baasID, apiKeyLive, apiKeyTest)
	if err != nil {
		fmt.Printf("[DEBUG] Erro em userRepo.Create: %v\n", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	tokenStr, _ := h.newJWT(int(id), "lojista")
	respondJSON(w, http.StatusCreated, dto.AuthResponse{
		Token:   tokenStr,
		Role:    "lojista",
		Message: "Registrado com sucesso",
	})
}

// Login — POST /api/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	rows, err := h.userRepo.GetAllForLogin()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erro interno"})
		return
	}
	defer rows.Close()

	var mID int
	var role, hash string
	found := false
	for rows.Next() {
		var id int
		var emailEnc, pwHash, r2 string
		rows.Scan(&id, &emailEnc, &pwHash, &r2)
		if h.crypto.Decrypt(emailEnc) == req.Email {
			mID, hash, role = id, pwHash, r2
			found = true
			break
		}
	}

	if !found || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Email ou senha inválidos"})
		return
	}

	tokenStr, _ := h.newJWT(mID, role)
	respondJSON(w, http.StatusOK, dto.AuthResponse{Token: tokenStr, Role: role})
}

func (h *AuthHandler) newJWT(merchantID int, role string) (string, error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"merchant_id": merchantID,
		"role":        role,
		"exp":         time.Now().Add(24 * time.Hour).Unix(),
	})
	return t.SignedString(h.jwtSecret)
}
