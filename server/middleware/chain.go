package middleware

import "net/http"

type Interceptor func(http.Handler) http.Handler
type InterceptorSet []Interceptor

func NewChain(interceptors ...Interceptor) InterceptorSet {
	return InterceptorSet(interceptors)
}

func (interceptors InterceptorSet) Finish(mux http.Handler) http.Handler {
	for i := len(interceptors) - 1; i >= 0; i-- {
		mux = interceptors[i](mux)
	}
	return mux
}
