// Note: The Docker Compose service uses these defaults:
//   - POSTGRES_PORT: 5439
//   - POSTGRES_DB: guardnest_db
//   - POSTGRES_USER: admin
//   - POSTGRES_PASSWORD: admin

package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Logs  LogConfig
	DB    PostgresConfig
	API ApiConfig
	Cookies CookiesConfig
	Next NextConfig
}

type LogConfig struct {
	Style string
	Level string
}

type PostgresConfig struct {
	DatabaseURL string
	DBMaxConns int32
}

type ApiConfig struct{
	Address string
	Port string
}

type CookiesConfig struct{
	Refresh string
	Session string
	
}

type NextConfig struct{
	RefreshUrl string
}

// validateRequiredEnvVars checks that critical environment variables are set
func validateRequiredEnvVars() error {
	requiredVars := []string{
		"DATABASE_URL",
		"API_ADDRESS",
		"API_PORT",
		"NEXT_REFRESH_URL",
		"REFRESH_COOKIE_NAME",
		"SESSION_COOKIE_NAME",
	}
	
	var missing []string
	for _, envVar := range requiredVars {
		if os.Getenv(envVar) == "" {
			missing = append(missing, envVar)
		}
	}
	
	if len(missing) > 0 {
		return fmt.Errorf("missing required environment variables: %v", missing)
	}
	
	return nil
}

func LoadConfig() (*Config, error) {
	// Load .env.local as the default environment file
	if err := godotenv.Load(".env.local"); err != nil {
		log.Printf("Warning: Could not load .env.local: %v", err)
		log.Fatalf("Terminating process due to .env.local load failure")
	} else {
		log.Printf("Loaded environment variables from .env.local")
	}
	
	// Validate critical environment variables
	if err := validateRequiredEnvVars(); err != nil {
		return nil, fmt.Errorf("missing required environment variables: %w", err)
	}
	
	cfg := &Config{
		Logs: LogConfig{
			Style: os.Getenv("LOG_STYLE"),
			Level: os.Getenv("LOG_LEVEL"),
		},
		DB: PostgresConfig{
			DatabaseURL: os.Getenv("DATABASE_URL"),
			DBMaxConns: func() int32 {
				val := os.Getenv("DATABASE_MAX_CONNECTIONS")
				if conns, err := strconv.Atoi(val); err == nil {
					return int32(conns)  // Add uint32 conversion here
				}
				return 10 // default if env var is missing or err
			}(),
		},
		API: ApiConfig{
		Address: os.Getenv("API_ADDRESS"),
		Port: os.Getenv("API_PORT"),
		
		},
		Next: NextConfig{
			RefreshUrl: os.Getenv("NEXT_REFRESH_URL"),
		},
		Cookies: CookiesConfig{
			Refresh: os.Getenv("REFRESH_COOKIE_NAME"),
			Session: os.Getenv("SESSION_COOKIE_NAME"),
		},
	}

	return cfg, nil
}