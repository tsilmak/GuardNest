package postgres

import (
	"context"
	"guardnest/internal/domain"
	"guardnest/internal/repository"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionRepository struct {
    pool *pgxpool.Pool
}

func NewSessionRepository(pool *pgxpool.Pool) repository.SessionRepository {
    return &SessionRepository{pool: pool}
}

func (r *SessionRepository) GetByToken(ctx context.Context, token string) (*domain.Session, error) {
    row := r.pool.QueryRow(ctx, `SELECT id, "userId", "expiresAt", "refreshToken", "refreshExpiresAt" FROM "session" WHERE token = $1`, token)
    var s domain.Session
    if err := row.Scan(&s.ID, &s.UserID, &s.ExpiresAt, &s.RefreshToken, &s.RefreshExpiresAt); err != nil {
        if err.Error() == "no rows in result set" {
            return nil, nil
        }
        return nil, err
    }
    return &s, nil
}

