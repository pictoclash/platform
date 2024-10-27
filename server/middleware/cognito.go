package middleware

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"pictoclash/middleware/auth"
	"strings"
	"time"

	"github.com/lestrrat-go/jwx/v2/jwt"
)

var (
	ErrClientIDNotFound  = errors.New("client_id not found")
	ErrMissingAuthHeader = errors.New("missing Authorization header")
)

var _ auth.Authenticator = &CognitoKeySet{}

type CognitoKeySet struct {
	key         *auth.CachedKey
	ClientID    string
	UserPoolURL string
}

func NewCognitoKeySet(ctx context.Context, clientID, userPoolURL, keyURL string) (*CognitoKeySet, error) {
	k := &CognitoKeySet{
		ClientID:    clientID,
		UserPoolURL: userPoolURL,
	}
	key, err := auth.NewCachedKey(ctx, keyURL)
	if err != nil {
		return nil, err
	}
	k.key = key
	return k, nil
}

func (k *CognitoKeySet) ValidateRequestAuth(r *http.Request) (context.Context, error) {
	ctx := r.Context()
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, ErrMissingAuthHeader
	}
	authHeader = strings.TrimPrefix(authHeader, "Bearer ")
	accessToken, err := k.ParseSignedToken(ctx, []byte(authHeader))
	if err != nil {
		return nil, err
	}
	idHeader := r.Header.Get("X-Identity")
	idToken, err := k.ParseSignedToken(ctx, []byte(idHeader))
	if err != nil {
		return nil, err
	}

	return k.AddContextInfo(ctx, accessToken, idToken), nil
}

func (k *CognitoKeySet) ParseSignedToken(ctx context.Context, signed []byte) (jwt.Token, error) {
	token, err := k.ParseSignedTokenWithoutValidate(ctx, signed)
	if err != nil {
		return nil, err
	}

	if token.Expiration().Before(time.Now()) {
		return nil, fmt.Errorf("token expired at %v", token.Expiration())
	}

	// Access tokens have client_id that should be equal to our client ID.
	// ID tokens should have the the client ID in the "aud" claim.
	clientID, ok := token.PrivateClaims()["client_id"].(string)
	if ok {
		if clientID != k.ClientID {
			return nil, fmt.Errorf("wrong client_id '%s'", clientID)
		}
	} else {
		// Require at least one aud claim, and all aud claims must match the client ID
		audOK := len(token.Audience()) > 0
		for _, aud := range token.Audience() {
			if aud != k.ClientID {
				audOK = false
				break
			}
		}
		if !audOK {
			return nil, ErrClientIDNotFound
		}
	}

	if token.Issuer() != k.UserPoolURL {
		return nil, fmt.Errorf("wrong issuer '%s'", token.Issuer())
	}

	return token, nil
}

func (k *CognitoKeySet) ParseSignedTokenWithoutValidate(ctx context.Context, signed []byte) (jwt.Token, error) {
	keyset, err := k.key.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("keyset lookup failed: %w", err)
	}
	token, err := jwt.Parse(signed, jwt.WithKeySet(keyset))
	if err != nil {
		return nil, err
	}
	return token, nil
}

func (k *CognitoKeySet) AddContextInfo(ctx context.Context, accessToken, idToken jwt.Token) context.Context {
	userID := accessToken.Subject()
	ctx = SetContextUserID(ctx, userID)

	if groups, ok := accessToken.PrivateClaims()["cognito:groups"].([]interface{}); ok {
		groupStrs := make([]string, 0, len(groups))
		for _, group := range groups {
			groupStrs = append(groupStrs, group.(string))
		}
		ctx = SetContextGroups(ctx, groupStrs)
	}

	if email, ok := idToken.PrivateClaims()["email"].(string); ok {
		ctx = SetContextEmail(ctx, email)
	}

	return ctx
}
