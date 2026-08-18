// Package config loads runtime configuration from environment variables.
// No value is ever hardcoded — see docs/Rules.md §6.
package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Env         string
	DatabaseURL string

	ClerkSecretKey            string
	ClerkJWKSURL              string
	ClerkWebhookSigningSecret string

	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2BucketName      string
	R2S3Endpoint      string
	R2PublicURL       string

	CORSAllowedOrigins []string

	RateLimitRequestsPerMinute int
}

// Load reads a .env file if present (local dev only — in staging/production
// the platform injects real env vars) and builds a validated Config.
func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		Env:         getEnv("ENV", "local"),
		DatabaseURL: os.Getenv("DATABASE_URL"),

		ClerkSecretKey:            os.Getenv("CLERK_SECRET_KEY"),
		ClerkJWKSURL:              os.Getenv("CLERK_JWKS_URL"),
		ClerkWebhookSigningSecret: os.Getenv("CLERK_WEBHOOK_SIGNING_SECRET"),

		R2AccountID:       os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2BucketName:      os.Getenv("R2_BUCKET_NAME"),
		R2S3Endpoint:      os.Getenv("R2_S3_ENDPOINT"),
		R2PublicURL:       os.Getenv("R2_PUBLIC_URL"),

		CORSAllowedOrigins: splitAndTrim(getEnv("CORS_ALLOWED_ORIGINS", "")),
	}

	rateLimit, err := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS_PER_MINUTE", "10"))
	if err != nil {
		return nil, fmt.Errorf("parse RATE_LIMIT_REQUESTS_PER_MINUTE: %w", err)
	}
	cfg.RateLimitRequestsPerMinute = rateLimit

	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) validate() error {
	missing := []string{}
	if c.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if c.ClerkSecretKey == "" {
		missing = append(missing, "CLERK_SECRET_KEY")
	}
	if c.ClerkJWKSURL == "" {
		missing = append(missing, "CLERK_JWKS_URL")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	return nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func splitAndTrim(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
