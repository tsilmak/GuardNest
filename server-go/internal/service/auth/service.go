package auth

import (
	"context"
	"fmt"
	"guardnest/internal/clients/next"
	"guardnest/internal/domain"
	"guardnest/internal/repository"
	"net/http"
	"time"
)

type Service struct {
    sessions repository.SessionRepository
    next     *next.Client
}

func NewService(s repository.SessionRepository, n *next.Client) *Service {
    return &Service{sessions: s, next: n}
}

// ValidateOrRefresh validates a session and triggers refresh when needed.
// It returns: session, setCookies to forward, needsRetry (when expired and refresh was triggered), error.
func (s *Service) ValidateOrRefresh(ctx context.Context, sessionID string, cookieHeader string) (*domain.Session, []string, bool, error) {
    rec, err := s.sessions.GetByToken(ctx, sessionID)
    if err != nil {
        return nil, nil, false, err
    }
    if rec == nil {
        return nil, nil, false, nil
    }

    now := time.Now()
    expired := now.After(rec.ExpiresAt)
    nearExpiry := !expired && time.Until(rec.ExpiresAt) <= 15*time.Minute

    if expired || nearExpiry {
        req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.next.RefreshURL, nil)
        if err != nil {
            return rec, nil, expired, err
        }
        if cookieHeader != "" {
            req.Header.Set("Cookie", cookieHeader)
        }
        resp, err := s.next.HTTP.Do(req)
        if err != nil {
            return rec, nil, expired, err
        }
        defer resp.Body.Close()
        if resp.StatusCode != http.StatusOK {
            return rec, nil, expired, fmt.Errorf("refresh failed: %d", resp.StatusCode)
        }
        return rec, resp.Header.Values("Set-Cookie"), expired, nil
    }
    return rec, nil, false, nil
}

// GetSessionValidity returns the session if valid (not expired) without triggering refresh.
func (s *Service) GetSessionValidity(ctx context.Context, sessionID string) (*domain.Session, error) {
    rec, err := s.sessions.GetByToken(ctx, sessionID)
    if err != nil || rec == nil {
        return nil, err
    }
    if time.Now().After(rec.ExpiresAt) {
        return nil, nil
    }
    return rec, nil
}

