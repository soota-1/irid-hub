package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type MembershipRepository struct {
	q *sqlcgen.Queries
}

func NewMembershipRepository(q *sqlcgen.Queries) *MembershipRepository {
	return &MembershipRepository{q: q}
}

var _ domain.MembershipRepository = (*MembershipRepository)(nil)

func toDomainMembership(m sqlcgen.Membership) *domain.Membership {
	return &domain.Membership{
		ID:          m.ID,
		CommunityID: m.CommunityID,
		UserID:      m.UserID,
		Role:        domain.MembershipRole(m.Role),
		Status:      domain.MembershipStatus(m.Status),
		JoinedAt:    tsToTime(m.JoinedAt),
		Bio:         textToPtr(m.Bio),
		CreatedAt:   tsToTime(m.CreatedAt),
		UpdatedAt:   tsToTime(m.UpdatedAt),
	}
}

func (r *MembershipRepository) Create(ctx context.Context, params domain.CreateMembershipParams) (*domain.Membership, error) {
	m, err := r.q.CreateMembership(ctx, sqlcgen.CreateMembershipParams{
		CommunityID: params.CommunityID,
		UserID:      params.UserID,
		Role:        string(params.Role),
	})
	if err != nil {
		return nil, err
	}
	return toDomainMembership(m), nil
}

func (r *MembershipRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Membership, error) {
	m, err := r.q.GetMembershipByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainMembership(m), nil
}

func (r *MembershipRepository) GetByCommunityAndUser(ctx context.Context, communityID, userID uuid.UUID) (*domain.Membership, error) {
	m, err := r.q.GetMembershipByCommunityAndUser(ctx, sqlcgen.GetMembershipByCommunityAndUserParams{
		CommunityID: communityID,
		UserID:      userID,
	})
	if err != nil {
		return nil, err
	}
	return toDomainMembership(m), nil
}

func (r *MembershipRepository) List(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error) {
	roleFilter := pgtype.Text{}
	if params.Role != nil {
		roleFilter = pgtype.Text{String: string(*params.Role), Valid: true}
	}
	statusFilter := pgtype.Text{}
	if params.Status != nil {
		statusFilter = pgtype.Text{String: string(*params.Status), Valid: true}
	}

	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListMemberships(ctx, sqlcgen.ListMembershipsParams{
		CommunityID: params.CommunityID,
		Role:        roleFilter,
		Status:      statusFilter,
		PageLimit:   int32(params.PerPage),
		PageOffset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountMemberships(ctx, sqlcgen.CountMembershipsParams{
		CommunityID: params.CommunityID,
		Role:        roleFilter,
		Status:      statusFilter,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.Membership, 0, len(rows))
	for _, m := range rows {
		result = append(result, *toDomainMembership(m))
	}
	return result, total, nil
}

func (r *MembershipRepository) UpdateRole(ctx context.Context, id uuid.UUID, role domain.MembershipRole) (*domain.Membership, error) {
	m, err := r.q.UpdateMembershipRole(ctx, sqlcgen.UpdateMembershipRoleParams{
		ID:   id,
		Role: string(role),
	})
	if err != nil {
		return nil, err
	}
	return toDomainMembership(m), nil
}
