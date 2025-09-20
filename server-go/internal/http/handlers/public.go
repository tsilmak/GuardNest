package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

func Public() http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]any{
            "message": "public ok",
            "time":    time.Now().UTC(),
        })
    })
}

