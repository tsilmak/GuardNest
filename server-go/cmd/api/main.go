package main

import (
	"context"
	"guardnest/internal/clients/next"
	"guardnest/internal/config"
	"guardnest/internal/db"
	routerhttp "guardnest/internal/http"
	"guardnest/internal/repository/postgres"
	"guardnest/internal/service/auth"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// Environment variables are loaded in config.LoadConfig()
	
    cfg, err := config.LoadConfig()
    if err != nil {
        log.Fatalf("config error: %v", err)
    }

    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    pool, err := db.NewPool(ctx, cfg.DB.DatabaseURL, cfg.DB.DBMaxConns)
    if err != nil {
        log.Fatalf("db init error: %v", err)
    }
    defer pool.Close()

    sessionRepo := postgres.NewSessionRepository(pool)
    nextClient := next.NewClient(cfg.Next.RefreshUrl) 
    svc := auth.NewService(sessionRepo, nextClient)

    mux := routerhttp.BuildRouter(svc, *cfg)

    srv := &http.Server{
        Addr:              cfg.API.Address + ":" + cfg.API.Port,
        Handler:           mux,
        ReadTimeout:       5 * time.Second,
        ReadHeaderTimeout: 2 * time.Second,
        WriteTimeout:      10 * time.Second,
        IdleTimeout:       60 * time.Second,
    }

    go func() {
        log.Printf("Go API listening on %s", srv.Addr)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("server error: %v", err)
        }
    }()

    <-ctx.Done()
    shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    _ = srv.Shutdown(shutdownCtx)
}

