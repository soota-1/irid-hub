//go:build integration

package repository

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_Integration_UserRepository_UpsertByClerkID_UpdatesOnConflict(t *testing.T) {
	repo := NewUserRepository(testQueries)
	clerkID := "clerk_" + uuid.NewString()
	ctx := context.Background()

	first, err := repo.UpsertByClerkID(ctx, domain.UpsertUserParams{ClerkUserID: clerkID, Email: "a@example.com"})
	require.NoError(t, err)

	second, err := repo.UpsertByClerkID(ctx, domain.UpsertUserParams{ClerkUserID: clerkID, Email: "b@example.com"})
	require.NoError(t, err)

	assert.Equal(t, first.ID, second.ID, "upsert on the same clerk_user_id must update the existing row, not insert a new one")
	assert.Equal(t, "b@example.com", second.Email)
}

func Test_Integration_UserRepository_GetByEmail_ReturnsNotFoundForUnknownEmail(t *testing.T) {
	repo := NewUserRepository(testQueries)

	_, err := repo.GetByEmail(context.Background(), "unknown-"+uuid.NewString()+"@example.com")

	require.Error(t, err)
}
