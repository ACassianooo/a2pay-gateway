// Package errors define os tipos de erro padronizados do Gato Gateway.
// Usar esses tipos permite que handlers retornem HTTP status codes corretos
// sem precisar conhecer detalhes de implementação dos services.
package errors

import "fmt"

// ── Tipos de erro ─────────────────────────────────────────────────────────────

// AppError é o tipo base de todos os erros da aplicação
type AppError struct {
	Code    string
	Message string
	Err     error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error { return e.Err }

// FraudError é retornado quando o antifraude bloqueia uma transação
type FraudError struct {
	Score   int
	Reasons []string
}

func (e *FraudError) Error() string {
	return fmt.Sprintf("transação bloqueada pelo antifraude (score=%d)", e.Score)
}

// ── Construtores ──────────────────────────────────────────────────────────────

func NotFound(resource string) *AppError {
	return &AppError{Code: "NOT_FOUND", Message: fmt.Sprintf("%s não encontrado", resource)}
}

func Unauthorized(msg string) *AppError {
	return &AppError{Code: "UNAUTHORIZED", Message: msg}
}

func InvalidInput(msg string) *AppError {
	return &AppError{Code: "INVALID_INPUT", Message: msg}
}

func ExternalService(provider string, err error) *AppError {
	return &AppError{Code: "EXTERNAL_SERVICE", Message: fmt.Sprintf("erro no serviço %s", provider), Err: err}
}

func Internal(msg string, err error) *AppError {
	return &AppError{Code: "INTERNAL", Message: msg, Err: err}
}

func Forbidden(msg string) *AppError {
	return &AppError{Code: "FORBIDDEN", Message: msg}
}
