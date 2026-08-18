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

func Test_Integration_MembershipApplicationRepository_HasPendingByEmail(t *testing.T) {
	repo := NewMembershipApplicationRepository(testQueries)
	communityID := mustCreateCommunity(t)
	email := uuid.NewString() + "@example.com"
	ctx := context.Background()

	before, err := repo.HasPendingByEmail(ctx, communityID, email)
	require.NoError(t, err)
	assert.False(t, before)

	_, err = repo.Create(ctx, domain.CreateMembershipApplicationParams{CommunityID: communityID, FullName: "A", Email: email, Phone: "0812"})
	require.NoError(t, err)

	after, err := repo.HasPendingByEmail(ctx, communityID, email)
	require.NoError(t, err)
	assert.True(t, after)
}

func Test_Integration_MembershipApplicationRepository_UpdateStatus_StopsCountingAsPending(t *testing.T) {
	repo := NewMembershipApplicationRepository(testQueries)
	communityID := mustCreateCommunity(t)
	reviewer := mustCreateUser(t)
	email := uuid.NewString() + "@example.com"
	ctx := context.Background()

	app, err := repo.Create(ctx, domain.CreateMembershipApplicationParams{CommunityID: communityID, FullName: "A", Email: email, Phone: "0812"})
	require.NoError(t, err)

	updated, err := repo.UpdateStatus(ctx, app.ID, domain.MembershipApplicationApproved, reviewer.ID)
	require.NoError(t, err)
	assert.Equal(t, domain.MembershipApplicationApproved, updated.Status)
	require.NotNil(t, updated.ReviewedBy)
	assert.Equal(t, reviewer.ID, *updated.ReviewedBy)

	stillPending, err := repo.HasPendingByEmail(ctx, communityID, email)
	require.NoError(t, err)
	assert.False(t, stillPending, "an approved application must no longer count as pending")
}
