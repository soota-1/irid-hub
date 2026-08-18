package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type MembershipService struct {
	repo domain.MembershipRepository
}

func NewMembershipService(repo domain.MembershipRepository) *MembershipService {
	return &MembershipService{repo: repo}
}

func (s *MembershipService) List(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error) {
	params.Page, params.PerPage = normalizePage(params.Page, params.PerPage)
	items, total, err := s.repo.List(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list memberships: %w", err)
	}
	return items, total, nil
}

func (s *MembershipService) UpdateRole(ctx context.Context, id uuid.UUID, role domain.MembershipRole) (*domain.Membership, error) {
	if !role.Valid() {
		return nil, &ValidationErr{Fields: map[string]string{"role": "harus salah satu dari: member, officer, admin"}}
	}
	m, err := s.repo.UpdateRole(ctx, id, role)
	if err != nil {
		return nil, fmt.Errorf("update membership role: %w", wrapNotFound(err))
	}
	return m, nil
}
