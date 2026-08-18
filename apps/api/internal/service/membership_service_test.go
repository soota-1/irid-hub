package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_MembershipService_UpdateRole_UpdatesToValidRole(t *testing.T) {
	id := uuid.New()
	want := &domain.Membership{ID: id, Role: domain.MembershipRoleOfficer}
	repo := &mockMembershipRepo{
		updateRole: func(ctx context.Context, gotID uuid.UUID, role domain.MembershipRole) (*domain.Membership, error) {
			assert.Equal(t, id, gotID)
			assert.Equal(t, domain.MembershipRoleOfficer, role)
			return want, nil
		},
	}
	svc := NewMembershipService(repo)

	got, err := svc.UpdateRole(context.Background(), id, domain.MembershipRoleOfficer)

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_MembershipService_UpdateRole_RejectsInvalidRole(t *testing.T) {
	repo := &mockMembershipRepo{
		updateRole: func(ctx context.Context, id uuid.UUID, role domain.MembershipRole) (*domain.Membership, error) {
			t.Fatal("repository should not be called when role is invalid")
			return nil, nil
		},
	}
	svc := NewMembershipService(repo)

	_, err := svc.UpdateRole(context.Background(), uuid.New(), domain.MembershipRole("superadmin"))

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_MembershipService_List_ReturnsItemsAndTotal(t *testing.T) {
	repo := &mockMembershipRepo{
		list: func(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error) {
			assert.Equal(t, 1, params.Page)
			assert.Equal(t, 20, params.PerPage)
			return []domain.Membership{{ID: uuid.New()}}, 1, nil
		},
	}
	svc := NewMembershipService(repo)

	items, total, err := svc.List(context.Background(), domain.ListMembershipsParams{CommunityID: uuid.New()})

	require.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, int64(1), total)
}
