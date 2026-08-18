package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type DashboardSummary struct {
	ActiveMemberCount   int64
	PendingApplications int64
	UpcomingEventCount  int64
}

// DashboardRepository is a narrow read-only port over the repositories
// the summary aggregates — see Task.md Phase 1.11.
type DashboardRepository interface {
	CountUpcomingEvents(ctx context.Context, communityID uuid.UUID) (int64, error)
}

type AdminDashboardService struct {
	membershipRepo  domain.MembershipRepository
	applicationRepo domain.MembershipApplicationRepository
	dashboardRepo   DashboardRepository
}

func NewAdminDashboardService(
	membershipRepo domain.MembershipRepository,
	applicationRepo domain.MembershipApplicationRepository,
	dashboardRepo DashboardRepository,
) *AdminDashboardService {
	return &AdminDashboardService{
		membershipRepo:  membershipRepo,
		applicationRepo: applicationRepo,
		dashboardRepo:   dashboardRepo,
	}
}

func (s *AdminDashboardService) GetSummary(ctx context.Context, communityID uuid.UUID) (*DashboardSummary, error) {
	activeStatus := domain.MembershipStatusActive
	_, activeMembers, err := s.membershipRepo.List(ctx, domain.ListMembershipsParams{
		CommunityID: communityID,
		Status:      &activeStatus,
		Page:        1,
		PerPage:     1,
	})
	if err != nil {
		return nil, fmt.Errorf("count active members: %w", err)
	}

	pendingStatus := domain.MembershipApplicationPending
	_, pendingApplications, err := s.applicationRepo.List(ctx, domain.ListMembershipApplicationsParams{
		CommunityID: communityID,
		Status:      &pendingStatus,
		Page:        1,
		PerPage:     1,
	})
	if err != nil {
		return nil, fmt.Errorf("count pending applications: %w", err)
	}

	upcomingEvents, err := s.dashboardRepo.CountUpcomingEvents(ctx, communityID)
	if err != nil {
		return nil, fmt.Errorf("count upcoming events: %w", err)
	}

	return &DashboardSummary{
		ActiveMemberCount:   activeMembers,
		PendingApplications: pendingApplications,
		UpcomingEventCount:  upcomingEvents,
	}, nil
}
