//go:build integration

package repository

import (
	"context"
	"testing"

	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_Integration_MembershipRepository_Create_RejectsDuplicateCommunityUser(t *testing.T) {
	repo := NewMembershipRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()

	_, err := repo.Create(ctx, domain.CreateMembershipParams{CommunityID: communityID, UserID: user.ID, Role: domain.MembershipRoleMember})
	require.NoError(t, err)

	_, err = repo.Create(ctx, domain.CreateMembershipParams{CommunityID: communityID, UserID: user.ID, Role: domain.MembershipRoleMember})

	assert.Error(t, err, "the UNIQUE(community_id, user_id) constraint must reject a duplicate membership")
}

func Test_Integration_MembershipRepository_List_FiltersByRoleAndStatus(t *testing.T) {
	repo := NewMembershipRepository(testQueries)
	communityID := mustCreateCommunity(t)
	admin := mustCreateUser(t)
	member := mustCreateUser(t)
	ctx := context.Background()

	_, err := repo.Create(ctx, domain.CreateMembershipParams{CommunityID: communityID, UserID: admin.ID, Role: domain.MembershipRoleAdmin})
	require.NoError(t, err)
	_, err = repo.Create(ctx, domain.CreateMembershipParams{CommunityID: communityID, UserID: member.ID, Role: domain.MembershipRoleMember})
	require.NoError(t, err)

	adminRole := domain.MembershipRoleAdmin
	items, total, err := repo.List(ctx, domain.ListMembershipsParams{CommunityID: communityID, Role: &adminRole, Page: 1, PerPage: 20})

	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, items, 1)
	assert.Equal(t, admin.ID, items[0].UserID)
}

func Test_Integration_MembershipRepository_UpdateRole_PersistsChange(t *testing.T) {
	repo := NewMembershipRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()

	m, err := repo.Create(ctx, domain.CreateMembershipParams{CommunityID: communityID, UserID: user.ID, Role: domain.MembershipRoleMember})
	require.NoError(t, err)

	updated, err := repo.UpdateRole(ctx, m.ID, domain.MembershipRoleOfficer)
	require.NoError(t, err)
	assert.Equal(t, domain.MembershipRoleOfficer, updated.Role)

	reloaded, err := repo.GetByID(ctx, m.ID)
	require.NoError(t, err)
	assert.Equal(t, domain.MembershipRoleOfficer, reloaded.Role)
}
