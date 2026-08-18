package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type MembershipApplicationService struct {
	repo           domain.MembershipApplicationRepository
	membershipRepo domain.MembershipRepository
	userRepo       domain.UserRepository
	communityRepo  domain.CommunityRepository
}

func NewMembershipApplicationService(
	repo domain.MembershipApplicationRepository,
	membershipRepo domain.MembershipRepository,
	userRepo domain.UserRepository,
	communityRepo domain.CommunityRepository,
) *MembershipApplicationService {
	return &MembershipApplicationService{
		repo:           repo,
		membershipRepo: membershipRepo,
		userRepo:       userRepo,
		communityRepo:  communityRepo,
	}
}

func (s *MembershipApplicationService) Submit(ctx context.Context, params domain.CreateMembershipApplicationParams) (*domain.MembershipApplication, error) {
	fields := map[string]string{}
	if params.FullName == "" {
		fields["full_name"] = "wajib diisi"
	}
	if params.Email == "" {
		fields["email"] = "wajib diisi"
	}
	if params.Phone == "" {
		fields["phone"] = "wajib diisi"
	}
	if len(fields) > 0 {
		return nil, &ValidationErr{Fields: fields}
	}

	hasPending, err := s.repo.HasPendingByEmail(ctx, params.CommunityID, params.Email)
	if err != nil {
		return nil, fmt.Errorf("check pending application: %w", err)
	}
	if hasPending {
		return nil, fmt.Errorf("membership application already pending for this email: %w", ErrConflict)
	}

	app, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create membership application: %w", err)
	}
	return app, nil
}

func (s *MembershipApplicationService) List(ctx context.Context, params domain.ListMembershipApplicationsParams) ([]domain.MembershipApplication, int64, error) {
	params.Page, params.PerPage = normalizePage(params.Page, params.PerPage)
	items, total, err := s.repo.List(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list membership applications: %w", err)
	}
	return items, total, nil
}

// Approve marks the application approved and, if the applicant already has
// a synced Clerk/user account (matched by email), creates their membership
// immediately. Otherwise membership creation is deferred: it happens the
// next time that email signs up and the user.created webhook fires — see
// Task.md Phase 1.5 note.
func (s *MembershipApplicationService) Approve(ctx context.Context, id, reviewerID uuid.UUID) (*domain.MembershipApplication, error) {
	app, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get membership application: %w", wrapNotFound(err))
	}
	if app.Status != domain.MembershipApplicationPending {
		return nil, fmt.Errorf("application already reviewed: %w", ErrConflict)
	}

	app, err = s.repo.UpdateStatus(ctx, id, domain.MembershipApplicationApproved, reviewerID)
	if err != nil {
		return nil, fmt.Errorf("approve membership application: %w", err)
	}

	if user, err := s.userRepo.GetByEmail(ctx, app.Email); err == nil {
		community, err := s.communityRepo.GetCurrent(ctx)
		if err != nil {
			return nil, fmt.Errorf("get current community: %w", err)
		}
		if _, err := s.membershipRepo.Create(ctx, domain.CreateMembershipParams{
			CommunityID: community.ID,
			UserID:      user.ID,
			Role:        domain.MembershipRoleMember,
		}); err != nil {
			return nil, fmt.Errorf("create membership after approval: %w", err)
		}
	} else if !errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("lookup user by email: %w", err)
	}

	return app, nil
}

func (s *MembershipApplicationService) Reject(ctx context.Context, id, reviewerID uuid.UUID) (*domain.MembershipApplication, error) {
	app, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get membership application: %w", wrapNotFound(err))
	}
	if app.Status != domain.MembershipApplicationPending {
		return nil, fmt.Errorf("application already reviewed: %w", ErrConflict)
	}

	app, err = s.repo.UpdateStatus(ctx, id, domain.MembershipApplicationRejected, reviewerID)
	if err != nil {
		return nil, fmt.Errorf("reject membership application: %w", err)
	}
	return app, nil
}
