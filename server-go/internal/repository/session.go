package repository

import (
	"context"
	"guardnest/internal/domain"
)



type SessionRepository interface {
    GetByToken(ctx context.Context, token string) (*domain.Session, error)
}

