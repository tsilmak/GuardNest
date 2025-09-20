package next

import (
	"net/http"
	"time"
)

type Client struct {
    RefreshURL string
    HTTP       *http.Client
}

func NewClient(refreshURL string) *Client {
    return &Client{
        RefreshURL: refreshURL,
        HTTP:       &http.Client{Timeout: 5 * time.Second},
    }
}

