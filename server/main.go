package main

import (
	"log"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("world"))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/hello", helloHandler)

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	log.Println("listening on http://localhost:8080")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}


