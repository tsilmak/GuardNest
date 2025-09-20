package handlers

import (
	"encoding/json"
	"guardnest/internal/service/auth"
	"net/http"
)

func Verify(svc *auth.Service, sessionCookieName string) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        var sessionID string
        for _, c := range r.Cookies() {
            if c.Name == sessionCookieName {
                sessionID = c.Value
                break
            }
        }
        if sessionID == "" {
            w.WriteHeader(http.StatusUnauthorized)
            _ = json.NewEncoder(w).Encode(map[string]any{"valid": false, "error": "missing session"})
            return
        }

        rec, err := svc.GetSessionValidity(r.Context(), sessionID)
        if err != nil || rec == nil {
            w.WriteHeader(http.StatusUnauthorized)
            _ = json.NewEncoder(w).Encode(map[string]any{"valid": false, "error": "invalid or expired"})
            return
        }
        _ = json.NewEncoder(w).Encode(map[string]any{"valid": true, "userId": rec.UserID})
    })
}

