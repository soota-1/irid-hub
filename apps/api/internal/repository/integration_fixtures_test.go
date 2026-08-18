//go:build integration

package repository

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/require"
)

// mustCreateCommunity inserts a community row directly (CommunityRepository
// only exposes GetCurrent — MVP is single-tenant by design, see Schema.md
// §1) with a random slug so parallel fixtures never collide.
func mustCreateCommunity(t *testing.T) uuid.UUID {
	t.Helper()
	var id uuid.UUID
	err := testPool.QueryRow(context.Background(),
		`INSERT INTO communities (slug, name) VALUES ($1, $2) RETURNING id`,
		"community-"+uuid.NewString(), "Test Community",
	).Scan(&id)
	require.NoError(t, err)
	return id
}

func mustCreateUser(t *testing.T) *domain.User {
	t.Helper()
	repo := NewUserRepository(testQueries)
	u, err := repo.UpsertByClerkID(context.Background(), domain.UpsertUserParams{
		ClerkUserID: "clerk_" + uuid.NewString(),
		Email:       uuid.NewString() + "@example.com",
	})
	require.NoError(t, err)
	return u
}
