// Package main is the Iridescent Hub API entrypoint.
//
// @title           Iridescent Hub API
// @version         1.0
// @description     Backend API for the Iridescent community hub (events, memberships, announcements, gallery, achievements).
// @BasePath        /api/v1
//
// @securityDefinitions.apikey  BearerAuth
// @in                          header
// @name                        Authorization
// @description                 Clerk session JWT, sent as "Bearer <token>".
package main

import (
	"context"
	"os"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/rs/zerolog"
	"github.com/soota-1/irid-hub/apps/api/internal/config"
	"github.com/soota-1/irid-hub/apps/api/internal/db"
	apihttp "github.com/soota-1/irid-hub/apps/api/internal/http"
)

func main() {
	logger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout}).With().Timestamp().Logger()

	cfg, err := config.Load()
	if err != nil {
		logger.Fatal().Err(err).Msg("load config")
	}

	ctx := context.Background()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Fatal().Err(err).Msg("connect database")
	}
	defer pool.Close()

	jwks, err := keyfunc.NewDefaultCtx(ctx, []string{cfg.ClerkJWKSURL})
	if err != nil {
		logger.Fatal().Err(err).Msg("load Clerk JWKS")
	}

	engine := apihttp.NewRouter(cfg, pool, jwks, logger)

	logger.Info().Str("port", cfg.Port).Str("env", cfg.Env).Msg("starting server")
	if err := engine.Run(":" + cfg.Port); err != nil {
		logger.Fatal().Err(err).Msg("server stopped")
	}
}
