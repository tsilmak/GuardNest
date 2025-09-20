package routerhttp

import (
	nethttp "net/http"

	"guardnest/internal/config"
	"guardnest/internal/http/handlers"
	"guardnest/internal/http/middleware"
	"guardnest/internal/service/auth"
)


func BuildRouter(svc *auth.Service, cfg config.Config) *nethttp.ServeMux {
	
    mux := nethttp.NewServeMux()

    cors := middleware.CORS

    mux.Handle("/api/public", cors(handlers.Public()))
    mux.Handle("/api/secure", cors(middleware.RequireAuth(svc, cfg.Cookies.Session)(handlers.Secure())))
    mux.Handle("/api/verify", cors(handlers.Verify(svc, cfg.Cookies.Session)))

    mux.HandleFunc("/healthz", func(w nethttp.ResponseWriter, r *nethttp.Request) { w.WriteHeader(nethttp.StatusNoContent) })

    return mux
}

