package service

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newMembershipApplicationService() (*MembershipApplicationService, *mockMembershipApplicationRepo, *mockMembershipRepo, *mockUserRepo, *mockCommunityRepo) {
	appRepo := &mockMembershipApplicationRepo{}
	membershipRepo := &mockMembershipRepo{}
	userRepo := &mockUserRepo{}
	communityRepo := &mockCommunityRepo{}
	svc := NewMembershipApplicationService(appRepo, membershipRepo, userRepo, communityRepo)
	return svc, appRepo, membershipRepo, userRepo, communityRepo
}

func Test_MembershipApplicationService_Submit_CreatesApplication(t *testing.T) {
	svc, appRepo, _, _, _ := newMembershipApplicationService()
	communityID := uuid.New()
	want := &domain.MembershipApplication{ID: uuid.New(), CommunityID: communityID, Email: "a@example.com"}

	appRepo.hasPendingByEmail = func(ctx context.Context, cID uuid.UUID, email string) (bool, error) {
		return false, nil
	}
	appRepo.create = func(ctx context.Context, params domain.CreateMembershipApplicationParams) (*domain.MembershipApplication, error) {
		return want, nil
	}

	got, err := svc.Submit(context.Background(), domain.CreateMembershipApplicationParams{
		CommunityID: communityID, FullName: "A", Email: "a@example.com", Phone: "0812",
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_MembershipApplicationService_Submit_RejectsDuplicatePendingEmail(t *testing.T) {
	svc, appRepo, _, _, _ := newMembershipApplicationService()
	appRepo.hasPendingByEmail = func(ctx context.Context, cID uuid.UUID, email string) (bool, error) {
		return true, nil
	}
	appRepo.create = func(ctx context.Context, params domain.CreateMembershipApplicationParams) (*domain.MembershipApplication, error) {
		t.Fatal("repository should not create a duplicate pending application")
		return nil, nil
	}

	_, err := svc.Submit(context.Background(), domain.CreateMembershipApplicationParams{
		CommunityID: uuid.New(), FullName: "A", Email: "a@example.com", Phone: "0812",
	})

	require.Error(t, err)
	assert.True(t, errors.Is(err, ErrConflict))
}

func Test_MembershipApplicationService_Approve_RejectsWhenAlreadyReviewed(t *testing.T) {
	svc, appRepo, _, _, _ := newMembershipApplicationService()
	appRepo.getByID = func(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
		return &domain.MembershipApplication{ID: id, Status: domain.MembershipApplicationApproved}, nil
	}
	appRepo.updateStatus = func(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
		t.Fatal("should not update status of an already-reviewed application")
		return nil, nil
	}

	_, err := svc.Approve(context.Background(), uuid.New(), uuid.New())

	require.Error(t, err)
	assert.True(t, errors.Is(err, ErrConflict))
}

func Test_MembershipApplicationService_Approve_CreatesMembershipWhenUserExists(t *testing.T) {
	svc, appRepo, membershipRepo, userRepo, communityRepo := newMembershipApplicationService()
	appID := uuid.New()
	communityID := uuid.New()
	userID := uuid.New()

	appRepo.getByID = func(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
		return &domain.MembershipApplication{ID: appID, CommunityID: communityID, Email: "a@example.com", Status: domain.MembershipApplicationPending}, nil
	}
	appRepo.updateStatus = func(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
		assert.Equal(t, domain.MembershipApplicationApproved, status)
		return &domain.MembershipApplication{ID: appID, CommunityID: communityID, Email: "a@example.com", Status: status}, nil
	}
	userRepo.getByEmail = func(ctx context.Context, email string) (*domain.User, error) {
		return &domain.User{ID: userID, Email: email}, nil
	}
	communityRepo.getCurrent = func(ctx context.Context) (*domain.Community, error) {
		return &domain.Community{ID: communityID}, nil
	}
	membershipCreated := false
	membershipRepo.create = func(ctx context.Context, params domain.CreateMembershipParams) (*domain.Membership, error) {
		membershipCreated = true
		assert.Equal(t, userID, params.UserID)
		assert.Equal(t, domain.MembershipRoleMember, params.Role)
		return &domain.Membership{ID: uuid.New()}, nil
	}

	_, err := svc.Approve(context.Background(), appID, uuid.New())

	require.NoError(t, err)
	assert.True(t, membershipCreated)
}

func Test_MembershipApplicationService_Approve_DefersMembershipWhenUserNotYetSynced(t *testing.T) {
	svc, appRepo, membershipRepo, userRepo, _ := newMembershipApplicationService()
	appID := uuid.New()

	appRepo.getByID = func(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
		return &domain.MembershipApplication{ID: appID, Email: "nouser@example.com", Status: domain.MembershipApplicationPending}, nil
	}
	appRepo.updateStatus = func(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
		return &domain.MembershipApplication{ID: appID, Status: status}, nil
	}
	userRepo.getByEmail = func(ctx context.Context, email string) (*domain.User, error) {
		return nil, pgx.ErrNoRows
	}
	membershipRepo.create = func(ctx context.Context, params domain.CreateMembershipParams) (*domain.Membership, error) {
		t.Fatal("membership should not be created before the applicant has a synced user")
		return nil, nil
	}

	app, err := svc.Approve(context.Background(), appID, uuid.New())

	require.NoError(t, err)
	assert.Equal(t, domain.MembershipApplicationApproved, app.Status)
}

func Test_MembershipApplicationService_List_ReturnsItemsAndTotal(t *testing.T) {
	svc, appRepo, _, _, _ := newMembershipApplicationService()
	appRepo.list = func(ctx context.Context, params domain.ListMembershipApplicationsParams) ([]domain.MembershipApplication, int64, error) {
		return []domain.MembershipApplication{{ID: uuid.New()}}, 1, nil
	}

	items, total, err := svc.List(context.Background(), domain.ListMembershipApplicationsParams{CommunityID: uuid.New()})

	require.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, int64(1), total)
}

func Test_MembershipApplicationService_Reject_MarksApplicationRejected(t *testing.T) {
	svc, appRepo, _, _, _ := newMembershipApplicationService()
	appID := uuid.New()
	appRepo.getByID = func(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
		return &domain.MembershipApplication{ID: appID, Status: domain.MembershipApplicationPending}, nil
	}
	appRepo.updateStatus = func(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
		assert.Equal(t, domain.MembershipApplicationRejected, status)
		return &domain.MembershipApplication{ID: appID, Status: status}, nil
	}

	app, err := svc.Reject(context.Background(), appID, uuid.New())

	require.NoError(t, err)
	assert.Equal(t, domain.MembershipApplicationRejected, app.Status)
}

func Test_MembershipApplicationService_Reject_RejectsWhenAlreadyReviewed(t *testing.T) {
	svc, appRepo, _, _, _ := newMembershipApplicationService()
	appRepo.getByID = func(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
		return &domain.MembershipApplication{ID: id, Status: domain.MembershipApplicationRejected}, nil
	}
	appRepo.updateStatus = func(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
		t.Fatal("should not update status of an already-reviewed application")
		return nil, nil
	}

	_, err := svc.Reject(context.Background(), uuid.New(), uuid.New())

	require.Error(t, err)
	assert.True(t, errors.Is(err, ErrConflict))
}
