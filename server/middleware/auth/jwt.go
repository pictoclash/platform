package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

type AuthCreator interface {
	NewSignedToken(userID string) ([]byte, error)
}

type Authenticator interface {
	ValidateRequestAuth(r *http.Request) (context.Context, error)
	ParseSignedToken(ctx context.Context, signed []byte) (jwt.Token, error)
	ParseSignedTokenWithoutValidate(ctx context.Context, signed []byte) (jwt.Token, error)
	AddContextInfo(ctx context.Context, accessToken jwt.Token, idToken jwt.Token) context.Context
}

var (
	_ Authenticator = &InvalidAuthenticator{}
)

// InvalidAuthenticator is an authenticator used when parameters are not
// configured or correct authentication. It fulfills the AuthVerifier interface,
// but always returns an error.
type InvalidAuthenticator struct{}

var ErrInvalidAuthenticator = errors.New("invalid authenticator)")

func (k *InvalidAuthenticator) ValidateRequestAuth(r *http.Request) (context.Context, error) {
	return nil, ErrInvalidAuthenticator
}

func (k *InvalidAuthenticator) ParseSignedToken(ctx context.Context, signed []byte) (jwt.Token, error) {
	return nil, ErrInvalidAuthenticator
}

func (k *InvalidAuthenticator) ParseSignedTokenWithoutValidate(ctx context.Context, signed []byte) (jwt.Token, error) {
	return nil, ErrInvalidAuthenticator
}

func (k *InvalidAuthenticator) AddContextInfo(ctx context.Context, accessToken jwt.Token, idToken jwt.Token) context.Context {
	return ctx
}

// CachedKey wraps jwk.Cache to provide cached and pre-checked access to a keyset
type CachedKey struct {
	keyURL string
	keys   *jwk.Cache
}

// NewCachedKey creates a cached keyset, and performs an initial refresh so that
// creation will fail if the key URL is invalid
func NewCachedKey(ctx context.Context, keyURL string) (*CachedKey, error) {
	k := &CachedKey{
		keyURL: keyURL,
		keys:   jwk.NewCache(ctx),
	}
	if err := k.keys.Register(keyURL); err != nil {
		return nil, err
	}
	if _, err := k.keys.Refresh(ctx, keyURL); err != nil {
		return nil, fmt.Errorf("initial key check failed: %w", err)
	}
	return k, nil
}

func (k *CachedKey) Get(ctx context.Context) (jwk.Set, error) {
	return k.keys.Get(ctx, k.keyURL)
}
