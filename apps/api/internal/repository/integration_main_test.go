//go:build integration

// Integration tests hit a real Postgres instance spun up via
// Testcontainers-go and run every migration against it, per Task.md
// Phase 1.12. Run with: go test -tags=integration ./internal/repository/...
// Requires Docker.
package repository

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

var (
	testPool    *pgxpool.Pool
	testQueries *sqlcgen.Queries
)

func TestMain(m *testing.M) {
	ctx := context.Background()

	container, err := tcpostgres.Run(ctx, "postgres:16-alpine",
		tcpostgres.WithDatabase("irid_hub_test"),
		tcpostgres.WithUsername("postgres"),
		tcpostgres.WithPassword("postgres"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").WithOccurrence(2),
		),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, "start postgres container:", err)
		os.Exit(1)
	}
	defer func() { _ = container.Terminate(ctx) }()

	connString, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		fmt.Fprintln(os.Stderr, "get connection string:", err)
		os.Exit(1)
	}

	migrationsPath, err := filepath.Abs("../../migrations")
	if err != nil {
		fmt.Fprintln(os.Stderr, "resolve migrations path:", err)
		os.Exit(1)
	}
	if err := runMigrations(connString, migrationsPath); err != nil {
		fmt.Fprintln(os.Stderr, "run migrations:", err)
		os.Exit(1)
	}

	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		fmt.Fprintln(os.Stderr, "connect pool:", err)
		os.Exit(1)
	}
	defer pool.Close()

	testPool = pool
	testQueries = sqlcgen.New(pool)

	os.Exit(m.Run())
}

func runMigrations(connString, migrationsPath string) error {
	db, err := migrate.New("file://"+filepath.ToSlash(migrationsPath), toMigrateURL(connString))
	if err != nil {
		return err
	}
	if err := db.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}
	return nil
}

// toMigrateURL swaps the postgres:// scheme for pgx5:// as required by
// golang-migrate's pgx/v5 database driver registration.
func toMigrateURL(connString string) string {
	return "pgx5://" + connString[len("postgres://"):]
}
