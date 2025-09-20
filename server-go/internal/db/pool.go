package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context, databaseURL string, maxConns int32) (*pgxpool.Pool, error) {
    cfg, err := pgxpool.ParseConfig(databaseURL)
    if err != nil {
        return nil, fmt.Errorf("parse db config: %w", err)
    }
    if maxConns > 0 {
        cfg.MaxConns = maxConns
    }
    cfg.ConnConfig.ConnectTimeout = 5 * time.Second
    pool, err := pgxpool.NewWithConfig(ctx, cfg)
    if err != nil {
        return nil, fmt.Errorf("create pool: %w", err)
    }
    return pool, nil
}

