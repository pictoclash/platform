package middleware

import (
	"log/slog"
	"net/http"

	"pictoclash/config"
	"pictoclash/middleware/auth"
	"pictoclash/twirp/pb"
)

var (
	nonAdminEndpoints = []string{}
)

func WithAuthentication(cfg *config.PictoclashConfig, authenticator auth.Authenticator) func(http.Handler) http.Handler {
	if cfg.IsEnvironmentLocal() {
		return WithLocalAuthentication(cfg, authenticator)
	}
	return WithDevAuthentication(cfg, authenticator)
}

// WithLocalAuthentication uses dev auth bypass to allow making requests as a user
// without auth
func WithLocalAuthentication(cfg *config.PictoclashConfig, authenticator auth.Authenticator) func(http.Handler) http.Handler {
	devAuthHandler := WithDevAuthentication(cfg, authenticator)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for public (unauthenticated) endpoints
			for _, endpoint := range nonAdminEndpoints {
				if r.URL.EscapedPath() == pb.PictoclashPathPrefix+endpoint {
					next.ServeHTTP(w, r)
					return
				}
			}

			currentUserID := r.Header.Get("X-Current-User-Id")
			if currentUserID != "" {
				ctx := r.Context()
				ctx = SetContextUserID(ctx, currentUserID)
				if email := r.Header.Get("X-Current-User-Email"); email != "" {
					ctx = SetContextEmail(ctx, email)
				}
				r = r.WithContext(ctx)
				next.ServeHTTP(w, r)
				return
			}

			devAuthHandler(next).ServeHTTP(w, r)
		})
	}
}

// WithDevAuthentication validates the Authorization header JWT and sets claims
// on the request context.
func WithDevAuthentication(cfg *config.PictoclashConfig, authenticator auth.Authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for public (unauthenticated) endpoints
			for _, endpoint := range nonAdminEndpoints {
				if r.URL.EscapedPath() == pb.PictoclashPathPrefix+endpoint {
					next.ServeHTTP(w, r)
					return
				}
			}

			ctx, err := authenticator.ValidateRequestAuth(r)
			if err != nil {
				slog.Error("request authentication failed", "err", err)
				http.Error(w, "authentication failed", http.StatusForbidden)
				return
			}
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}
