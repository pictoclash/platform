package middleware

import "net/http"

// WithDevCORSHeaders sets CORS headers needed for local development. For OPTIONS
// requests, this middleware will short circuit and return 200.
func WithDevCORSHeaders() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("Access-Control-Allow-Origin", "*")
			w.Header().Add("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization, X-Current-User-Id, X-Current-User-Email")
			if r.Method == "OPTIONS" {
				// TODO: only return 200 for endpoints that exist
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
