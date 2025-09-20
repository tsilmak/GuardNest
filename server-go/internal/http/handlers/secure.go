package handlers

import (
	"encoding/json"
	"guardnest/internal/http/middleware"
	"net/http"
	"time"
)

func Secure() http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        userID, _ := middleware.UserIDFromContext(r.Context())
        _ = json.NewEncoder(w).Encode(map[string]any{
            "message": "secure ok",
            "userId":  userID,
            "time":    time.Now().UTC(),
        })
    })
}

