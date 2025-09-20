package config

import (
	"os"

	"testing"

	_ "github.com/lib/pq"
)

func TestConfig(t *testing.T) {
	
	// Check all environment variables used in config.go
	requiredEnvVars := []string{
		"API_ADDRESS",
		"API_PORT", 
		"SESSION_COOKIE_NAME",
		"REFRESH_COOKIE_NAME",
		"DATABASE_URL",
		"DATABASE_MAX_CONNECTIONS",
		"NEXT_REFRESH_URL",
	}
	


	// Check required environment variables
	var missingVars []string
	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			missingVars = append(missingVars, envVar)
		}
	}

	if len(missingVars) > 0 {
		t.Fatalf("Missing required environment variables: %v", missingVars)
	}

	// Loads config from the config.go file
	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	
	// Verify that config was loaded properly
	if cfg == nil {
		t.Fatal("config is nil")
	}
	
	// Print config for debugging (optional)
	t.Logf("Config loaded successfully: %+v", cfg)
}