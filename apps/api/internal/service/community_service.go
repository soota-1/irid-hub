package service

import (
	"context"
	"fmt"

	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type CommunityService struct {
	repo domain.CommunityRepository
}

func NewCommunityService(repo domain.CommunityRepository) *CommunityService {
	return &CommunityService{repo: repo}
}

func (s *CommunityService) GetCurrent(ctx context.Context) (*domain.Community, error) {
	c, err := s.repo.GetCurrent(ctx)
	if err != nil {
		return nil, fmt.Errorf("get current community: %w", wrapNotFound(err))
	}
	return c, nil
}
