package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type UserService struct {
	repo domain.UserRepository
}

func NewUserService(repo domain.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// SyncFromClerk upserts the local user copy from a Clerk
// user.created/user.updated webhook event.
func (s *UserService) SyncFromClerk(ctx context.Context, params domain.UpsertUserParams) (*domain.User, error) {
	if params.ClerkUserID == "" || params.Email == "" {
		return nil, &ValidationErr{Fields: map[string]string{"clerk_user_id": "wajib diisi"}}
	}
	u, err := s.repo.UpsertByClerkID(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("sync user from clerk: %w", err)
	}
	return u, nil
}

func (s *UserService) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user: %w", wrapNotFound(err))
	}
	return u, nil
}
