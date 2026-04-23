package middleware

import (
	"log"
	"net/http"
	"time"
)

// Logger registra método, path, status e duração de cada requisição
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rw, r)

		duration := time.Since(start)
		status := rw.status

		// Log diferenciado para erros para facilitar monitoramento
		icon := "✅"
		if status >= 500 {
			icon = "🚨"
		} else if status >= 400 {
			icon = "⚠️ "
		}

		log.Printf("%s [HTTP] %s %s → %d (%s)", icon, r.Method, r.URL.Path, status, duration)
	})
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}
