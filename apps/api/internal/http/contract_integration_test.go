//go:build integration

// Contract tests replay real HTTP requests against the full router (backed
// by a Testcontainers Postgres instance) and validate the responses against
// the generated OpenAPI 3 spec (docs/openapi.json) — Task.md Phase 1.12.
// Run with: go test -tags=integration ./internal/http/... (requires Docker
// and `go run ./cmd/openapi-gen` to have produced docs/openapi.json).
package http

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/MicahParks/jwkset"
	"github.com/MicahParks/keyfunc/v3"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/getkin/kin-openapi/routers"
	"github.com/getkin/kin-openapi/routers/gorillamux"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/soota-1/irid-hub/apps/api/internal/config"
)

// stubKeyfunc satisfies keyfunc.Keyfunc without any network call. Contract
// tests only exercise public routes, so its Keyfunc method is never
// actually invoked by middleware.Auth.
type stubKeyfunc struct{}

func (stubKeyfunc) Keyfunc(*jwt.Token) (any, error) {
	return nil, fmt.Errorf("not implemented in tests")
}
func (stubKeyfunc) KeyfuncCtx(context.Context) jwt.Keyfunc {
	return func(*jwt.Token) (any, error) { return nil, fmt.Errorf("not implemented in tests") }
}
func (stubKeyfunc) Storage() jwkset.Storage { return nil }
func (stubKeyfunc) VerificationKeySet(context.Context) (jwt.VerificationKeySet, error) {
	return jwt.VerificationKeySet{}, fmt.Errorf("not implemented in tests")
}

var _ keyfunc.Keyfunc = stubKeyfunc{}

func setupContractTestEngine(t *testing.T) *gin.Engine {
	t.Helper()
	ctx := context.Background()

	container, err := tcpostgres.Run(ctx, "postgres:16-alpine",
		tcpostgres.WithDatabase("irid_hub_contract_test"),
		tcpostgres.WithUsername("postgres"),
		tcpostgres.WithPassword("postgres"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").WithOccurrence(2),
		),
	)
	require.NoError(t, err)
	t.Cleanup(func() { _ = container.Terminate(ctx) })

	connString, err := container.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	migrationsPath, err := filepath.Abs("../../migrations")
	require.NoError(t, err)
	db, err := migrate.New("file://"+filepath.ToSlash(migrationsPath), "pgx5://"+connString[len("postgres://"):])
	require.NoError(t, err)
	if err := db.Up(); err != nil && err != migrate.ErrNoChange {
		require.NoError(t, err)
	}

	pool, err := pgxpool.New(ctx, connString)
	require.NoError(t, err)
	t.Cleanup(pool.Close)

	_, err = pool.Exec(ctx, `INSERT INTO communities (slug, name) VALUES ('iridescent', 'Iridescent')`)
	require.NoError(t, err)

	cfg := &config.Config{
		Port: "8080", Env: "test", DatabaseURL: connString,
		ClerkSecretKey: "sk_test_stub", ClerkJWKSURL: "https://stub.example.com/.well-known/jwks.json",
		CORSAllowedOrigins: []string{"http://localhost:5173"}, RateLimitRequestsPerMinute: 100,
	}
	logger := zerolog.New(os.Stderr)

	return NewRouter(cfg, pool, stubKeyfunc{}, logger)
}

func loadOpenAPISpec(t *testing.T) routers.Router {
	t.Helper()
	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromFile("../../docs/openapi.json")
	require.NoError(t, err, "run `go run ./cmd/openapi-gen` first")
	require.NoError(t, doc.Validate(context.Background()))

	router, err := gorillamux.NewRouter(doc)
	require.NoError(t, err)
	return router
}

// assertResponseMatchesSpec replays req against engine and validates the
// response body/status against the OpenAPI 3 spec loaded from
// docs/openapi.json.
func assertResponseMatchesSpec(t *testing.T, engine *gin.Engine, specRouter routers.Router, req *http.Request) *httptest.ResponseRecorder {
	t.Helper()

	route, pathParams, err := specRouter.FindRoute(req)
	require.NoError(t, err, "request path/method must exist in the OpenAPI spec")

	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	responseValidationInput := &openapi3filter.ResponseValidationInput{
		RequestValidationInput: &openapi3filter.RequestValidationInput{
			Request:    req,
			PathParams: pathParams,
			Route:      route,
		},
		Status: rec.Code,
		Header: rec.Header(),
	}
	responseValidationInput.SetBodyBytes(rec.Body.Bytes())

	err = openapi3filter.ValidateResponse(context.Background(), responseValidationInput)
	require.NoError(t, err, "response for %s %s did not match the OpenAPI spec: %s", req.Method, req.URL.Path, rec.Body.String())

	return rec
}

func Test_Contract_GetCommunity_MatchesOpenAPISpec(t *testing.T) {
	engine := setupContractTestEngine(t)
	specRouter := loadOpenAPISpec(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/community", nil)
	rec := assertResponseMatchesSpec(t, engine, specRouter, req)

	require.Equal(t, http.StatusOK, rec.Code)
}

func Test_Contract_ListEvents_MatchesOpenAPISpec(t *testing.T) {
	engine := setupContractTestEngine(t)
	specRouter := loadOpenAPISpec(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/events", nil)
	rec := assertResponseMatchesSpec(t, engine, specRouter, req)

	require.Equal(t, http.StatusOK, rec.Code)
}

func Test_Contract_GetUsersMe_WithoutAuth_MatchesOpenAPISpec(t *testing.T) {
	engine := setupContractTestEngine(t)
	specRouter := loadOpenAPISpec(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/me", nil)
	rec := assertResponseMatchesSpec(t, engine, specRouter, req)

	require.Equal(t, http.StatusUnauthorized, rec.Code)
}

func Test_Contract_SubmitMembershipApplication_ValidationError_MatchesOpenAPISpec(t *testing.T) {
	engine := setupContractTestEngine(t)
	specRouter := loadOpenAPISpec(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/membership-applications", nil)
	req.Header.Set("Content-Type", "application/json")
	rec := assertResponseMatchesSpec(t, engine, specRouter, req)

	require.Equal(t, http.StatusUnprocessableEntity, rec.Code)
}
