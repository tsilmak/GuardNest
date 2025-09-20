package middleware

import (
	"context"
	"encoding/json"
	"guardnest/internal/service/auth"
	"net/http"
)

type ctxKeyUserID struct{}

func UserIDFromContext(ctx context.Context) (string, bool) {
    v := ctx.Value(ctxKeyUserID{})
    s, ok := v.(string)
    return s, ok
}

func RequireAuth(svc *auth.Service, sessionCookieName string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            var sessionID string
            for _, c := range r.Cookies() {
                if c.Name == sessionCookieName {
                    sessionID = c.Value
                    break
                }
            }
            if sessionID == "" {
                w.WriteHeader(http.StatusUnauthorized)
                _ = json.NewEncoder(w).Encode(map[string]string{"error": "missing session"})
                return
            }

            rec, setCookies, expired, err := svc.ValidateOrRefresh(r.Context(), sessionID, r.Header.Get("Cookie"))
            if err != nil || rec == nil {
                w.WriteHeader(http.StatusUnauthorized)
                _ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
                return
            }
            for _, sc := range setCookies {
                w.Header().Add("Set-Cookie", sc)
            }
            if expired && len(setCookies) > 0 {
                // Advise client to retry with updated cookies if we just refreshed from expired state
                w.WriteHeader(http.StatusUnauthorized)
                _ = json.NewEncoder(w).Encode(map[string]string{"error": "expired, refresh triggered"})
                return
            }
            ctx := context.WithValue(r.Context(), ctxKeyUserID{}, rec.UserID)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

