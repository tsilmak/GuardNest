package domain

import (
	"time"
)

type Session struct {
    ID               string
    UserID           string
    ExpiresAt        time.Time
    RefreshToken     *string
    RefreshExpiresAt *time.Time
}