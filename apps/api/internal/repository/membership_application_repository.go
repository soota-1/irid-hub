package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type MembershipApplicationRepository struct {
	q *sqlcgen.Queries
}

func NewMembershipApplicationRepository(q *sqlcgen.Queries) *MembershipApplicationRepository {
	return &MembershipApplicationRepository{q: q}
}

var _ domain.MembershipApplicationRepository = (*MembershipApplicationRepository)(nil)

func toDomainMembershipApplication(a sqlcgen.MembershipApplication) *domain.MembershipApplication {
	return &domain.MembershipApplication{
		ID:          a.ID,
		CommunityID: a.CommunityID,
		FullName:    a.FullName,
		Email:       a.Email,
		Phone:       a.Phone,
		Motivation:  textToPtr(a.Motivation),
		Status:      domain.MembershipApplicationStatus(a.Status),
		ReviewedBy:  uuidToPtr(a.ReviewedBy),
		ReviewedAt:  tsToTimePtr(a.ReviewedAt),
		CreatedAt:   tsToTime(a.CreatedAt),
		UpdatedAt:   tsToTime(a.UpdatedAt),
	}
}

func (r *MembershipApplicationRepository) Create(ctx context.Context, params domain.CreateMembershipApplicationParams) (*domain.MembershipApplication, error) {
	a, err := r.q.CreateMembershipApplication(ctx, sqlcgen.CreateMembershipApplicationParams{
		CommunityID: params.CommunityID,
		FullName:    params.FullName,
		Email:       params.Email,
		Phone:       params.Phone,
		Motivation:  ptrToText(params.Motivation),
	})
	if err != nil {
		return nil, err
	}
	return toDomainMembershipApplication(a), nil
}

func (r *MembershipApplicationRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
	a, err := r.q.GetMembershipApplicationByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainMembershipApplication(a), nil
}

func (r *MembershipApplicationRepository) List(ctx context.Context, params domain.ListMembershipApplicationsParams) ([]domain.MembershipApplication, int64, error) {
	statusFilter := pgtype.Text{}
	if params.Status != nil {
		statusFilter = pgtype.Text{String: string(*params.Status), Valid: true}
	}

	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListMembershipApplications(ctx, sqlcgen.ListMembershipApplicationsParams{
		CommunityID: params.CommunityID,
		Status:      statusFilter,
		PageLimit:   int32(params.PerPage),
		PageOffset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountMembershipApplications(ctx, sqlcgen.CountMembershipApplicationsParams{
		CommunityID: params.CommunityID,
		Status:      statusFilter,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.MembershipApplication, 0, len(rows))
	for _, a := range rows {
		result = append(result, *toDomainMembershipApplication(a))
	}
	return result, total, nil
}

func (r *MembershipApplicationRepository) HasPendingByEmail(ctx context.Context, communityID uuid.UUID, email string) (bool, error) {
	return r.q.HasPendingMembershipApplicationByEmail(ctx, sqlcgen.HasPendingMembershipApplicationByEmailParams{
		CommunityID: communityID,
		Email:       email,
	})
}

func (r *MembershipApplicationRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
	a, err := r.q.UpdateMembershipApplicationStatus(ctx, sqlcgen.UpdateMembershipApplicationStatusParams{
		ID:         id,
		Status:     string(status),
		ReviewedBy: ptrToUUID(&reviewedBy),
	})
	if err != nil {
		return nil, err
	}
	return toDomainMembershipApplication(a), nil
}
