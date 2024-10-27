package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

// wrappedRespWriter is an http.ResponseWriter that wraps another http.ResponseWriter,
// tracking response size and status code for logging.
type wrappedRespWriter struct {
	w            http.ResponseWriter
	writtenBytes int
	statusCode   int
}

func (w *wrappedRespWriter) Header() http.Header {
	return w.w.Header()
}

func (w *wrappedRespWriter) Write(b []byte) (int, error) {
	w.writtenBytes += len(b)
	return w.w.Write(b)
}

func (w *wrappedRespWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.w.WriteHeader(statusCode)
}

// LogRequest is a middleware that logs each request's path, status code, and
// response time.
func LogRequest() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			wrappedW := &wrappedRespWriter{
				w: w,
			}
			next.ServeHTTP(wrappedW, r)
			durStr := fmt.Sprintf("%.2f", float64(time.Since(start).Microseconds())/1000)
			slog.Info(
				"req",
				"path", r.URL.Path,
				"status", wrappedW.statusCode,
				"duration", durStr,
			)
		})
	}
}
