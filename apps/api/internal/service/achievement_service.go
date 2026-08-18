package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type AchievementService struct {
	repo domain.AchievementRepository
}

func NewAchievementService(repo domain.AchievementRepository) *AchievementService {
	return &AchievementService{repo: repo}
}

func (s *AchievementService) List(ctx context.Context, params domain.ListAchievementsParams) ([]domain.Achievement, int64, error) {
	params.Page, params.PerPage = normalizePage(params.Page, params.PerPage)
	items, total, err := s.repo.List(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list achievements: %w", err)
	}
	return items, total, nil
}

func (s *AchievementService) Create(ctx context.Context, params domain.CreateAchievementParams) (*domain.Achievement, error) {
	if err := validateAchievementFields(params.Title, params.AchievedAt); err != nil {
		return nil, err
	}
	a, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create achievement: %w", err)
	}
	return a, nil
}

func (s *AchievementService) Update(ctx context.Context, params domain.UpdateAchievementParams) (*domain.Achievement, error) {
	if err := validateAchievementFields(params.Title, params.AchievedAt); err != nil {
		return nil, err
	}
	a, err := s.repo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update achievement: %w", wrapNotFound(err))
	}
	return a, nil
}

func (s *AchievementService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete achievement: %w", wrapNotFound(err))
	}
	return nil
}

func validateAchievementFields(title string, achievedAt time.Time) error {
	fields := map[string]string{}
	if title == "" {
		fields["title"] = "wajib diisi"
	}
	if achievedAt.IsZero() {
		fields["achieved_at"] = "wajib diisi"
	}
	if len(fields) > 0 {
		return &ValidationErr{Fields: fields}
	}
	return nil
}
