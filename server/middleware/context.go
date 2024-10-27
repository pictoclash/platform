package middleware

import (
	"context"

	"pictoclash/set"

	"github.com/google/uuid"
)

type contextUserID struct{}

func SetContextUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, contextUserID{}, userID)
}

func ContextUserID(ctx context.Context) uuid.UUID {
	userID, ok := ctx.Value(contextUserID{}).(string)
	if ok {
		return uuid.MustParse(userID)
	}
	panic("context without user id")
}

type contextGroups struct{}

func SetContextGroups(ctx context.Context, groups []string) context.Context {
	return context.WithValue(ctx, contextGroups{}, set.New(groups...))
}

func ContextGroups(ctx context.Context) set.Set[string] {
	groups, ok := ctx.Value(contextGroups{}).(set.Set[string])
	if ok {
		return groups
	}
	return set.New[string]()
}

type contextEmail struct{}

func SetContextEmail(ctx context.Context, email string) context.Context {
	return context.WithValue(ctx, contextEmail{}, email)
}

func ContextEmail(ctx context.Context) string {
	email, ok := ctx.Value(contextEmail{}).(string)
	if ok {
		return email
	}
	return ""
}
