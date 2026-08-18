package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type TrainingScheduleService struct {
	repo domain.TrainingScheduleRepository
}

func NewTrainingScheduleService(repo domain.TrainingScheduleRepository) *TrainingScheduleService {
	return &TrainingScheduleService{repo: repo}
}

func (s *TrainingScheduleService) ListActive(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
	items, err := s.repo.ListActive(ctx, communityID)
	if err != nil {
		return nil, fmt.Errorf("list active training schedules: %w", err)
	}
	return items, nil
}

// ListAll is admin-only: includes inactive schedules — Task.md Phase 2.4.
func (s *TrainingScheduleService) ListAll(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
	items, err := s.repo.ListAll(ctx, communityID)
	if err != nil {
		return nil, fmt.Errorf("list all training schedules: %w", err)
	}
	return items, nil
}

func (s *TrainingScheduleService) Create(ctx context.Context, params domain.CreateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
	if err := validateScheduleFields(params.Title, params.DayOfWeek); err != nil {
		return nil, err
	}
	sc, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create training schedule: %w", err)
	}
	return sc, nil
}

func (s *TrainingScheduleService) Update(ctx context.Context, params domain.UpdateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
	if err := validateScheduleFields(params.Title, params.DayOfWeek); err != nil {
		return nil, err
	}
	sc, err := s.repo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update training schedule: %w", wrapNotFound(err))
	}
	return sc, nil
}

func (s *TrainingScheduleService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete training schedule: %w", wrapNotFound(err))
	}
	return nil
}

func validateScheduleFields(title string, dayOfWeek int16) error {
	fields := map[string]string{}
	if title == "" {
		fields["title"] = "wajib diisi"
	}
	if dayOfWeek < 0 || dayOfWeek > 6 {
		fields["day_of_week"] = "harus antara 0 (Minggu) dan 6 (Sabtu)"
	}
	if len(fields) > 0 {
		return &ValidationErr{Fields: fields}
	}
	return nil
}
