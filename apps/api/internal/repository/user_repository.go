package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type UserRepository struct {
	q *sqlcgen.Queries
}

func NewUserRepository(q *sqlcgen.Queries) *UserRepository {
	return &UserRepository{q: q}
}

var _ domain.UserRepository = (*UserRepository)(nil)

func toDomainUser(u sqlcgen.User) *domain.User {
	return &domain.User{
		ID:          u.ID,
		ClerkUserID: u.ClerkUserID,
		Email:       u.Email,
		FullName:    textToPtr(u.FullName),
		AvatarURL:   textToPtr(u.AvatarUrl),
		Phone:       textToPtr(u.Phone),
		CreatedAt:   tsToTime(u.CreatedAt),
		UpdatedAt:   tsToTime(u.UpdatedAt),
	}
}

func (r *UserRepository) UpsertByClerkID(ctx context.Context, params domain.UpsertUserParams) (*domain.User, error) {
	u, err := r.q.UpsertUserByClerkID(ctx, sqlcgen.UpsertUserByClerkIDParams{
		ClerkUserID: params.ClerkUserID,
		Email:       params.Email,
		FullName:    ptrToText(params.FullName),
		AvatarUrl:   ptrToText(params.AvatarURL),
		Phone:       ptrToText(params.Phone),
	})
	if err != nil {
		return nil, err
	}
	return toDomainUser(u), nil
}

func (r *UserRepository) GetByClerkID(ctx context.Context, clerkUserID string) (*domain.User, error) {
	u, err := r.q.GetUserByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}
	return toDomainUser(u), nil
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	u, err := r.q.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainUser(u), nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	u, err := r.q.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return toDomainUser(u), nil
}
