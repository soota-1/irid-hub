package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockDashboardRepo struct {
	countUpcomingEvents func(ctx context.Context, communityID uuid.UUID) (int64, error)
}

func (m *mockDashboardRepo) CountUpcomingEvents(ctx context.Context, communityID uuid.UUID) (int64, error) {
	return m.countUpcomingEvents(ctx, communityID)
}

func Test_AdminDashboardService_GetSummary_AggregatesCounts(t *testing.T) {
	communityID := uuid.New()
	membershipRepo := &mockMembershipRepo{
		list: func(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error) {
			return nil, 12, nil
		},
	}
	applicationRepo := &mockMembershipApplicationRepo{
		list: func(ctx context.Context, params domain.ListMembershipApplicationsParams) ([]domain.MembershipApplication, int64, error) {
			return nil, 3, nil
		},
	}
	dashboardRepo := &mockDashboardRepo{
		countUpcomingEvents: func(ctx context.Context, id uuid.UUID) (int64, error) {
			assert.Equal(t, communityID, id)
			return 5, nil
		},
	}
	svc := NewAdminDashboardService(membershipRepo, applicationRepo, dashboardRepo)

	summary, err := svc.GetSummary(context.Background(), communityID)

	require.NoError(t, err)
	assert.Equal(t, int64(12), summary.ActiveMemberCount)
	assert.Equal(t, int64(3), summary.PendingApplications)
	assert.Equal(t, int64(5), summary.UpcomingEventCount)
}

func Test_AdminDashboardService_GetSummary_PropagatesRepositoryError(t *testing.T) {
	membershipRepo := &mockMembershipRepo{
		list: func(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error) {
			return nil, 0, assert.AnError
		},
	}
	applicationRepo := &mockMembershipApplicationRepo{}
	dashboardRepo := &mockDashboardRepo{}
	svc := NewAdminDashboardService(membershipRepo, applicationRepo, dashboardRepo)

	_, err := svc.GetSummary(context.Background(), uuid.New())

	require.Error(t, err)
}
