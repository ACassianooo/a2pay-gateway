package middleware

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"
)

type rateBucket struct {
	timestamps []time.Time
	mu         sync.Mutex
}

var rateLimits sync.Map

// RateLimiter bloqueia IPs que excedem `limit` requisições dentro de `window`
func RateLimiter(limit int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip, _, _ := net.SplitHostPort(r.RemoteAddr)
			if ip == "" {
				ip = r.RemoteAddr
			}
			val, _ := rateLimits.LoadOrStore(ip, &rateBucket{})
			bucket := val.(*rateBucket)
			bucket.mu.Lock()
			now := time.Now()
			valid := bucket.timestamps[:0]
			for _, t := range bucket.timestamps {
				if now.Sub(t) < window {
					valid = append(valid, t)
				}
			}
			bucket.timestamps = valid
			if len(bucket.timestamps) >= limit {
				bucket.mu.Unlock()
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", fmt.Sprintf("%.0f", window.Seconds()))
				w.WriteHeader(http.StatusTooManyRequests)
				json.NewEncoder(w).Encode(map[string]string{
					"error": fmt.Sprintf("Muitas tentativas. Aguarde %.0f segundos.", window.Seconds()),
				})
				return
			}
			bucket.timestamps = append(bucket.timestamps, now)
			bucket.mu.Unlock()
			next.ServeHTTP(w, r)
		})
	}
}
