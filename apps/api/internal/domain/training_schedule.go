package domain

import (
	"context"

	"github.com/google/uuid"
)

type TrainingSchedule struct {
	ID          uuid.UUID
	CommunityID uuid.UUID
	Title       string
	DayOfWeek   int16
	StartTime   string // "HH:MM:SS"
	EndTime     string
	Location    *string
	IsActive    bool
}

type CreateTrainingScheduleParams struct {
	CommunityID uuid.UUID
	Title       string
	DayOfWeek   int16
	StartTime   string
	EndTime     string
	Location    *string
	IsActive    bool
}

type UpdateTrainingScheduleParams struct {
	ID        uuid.UUID
	Title     string
	DayOfWeek int16
	StartTime string
	EndTime   string
	Location  *string
	IsActive  bool
}

type TrainingScheduleRepository interface {
	Create(ctx context.Context, params CreateTrainingScheduleParams) (*TrainingSchedule, error)
	GetByID(ctx context.Context, id uuid.UUID) (*TrainingSchedule, error)
	ListActive(ctx context.Context, communityID uuid.UUID) ([]TrainingSchedule, error)
	// ListAll is admin-only: includes inactive schedules too — Task.md Phase 2.4.
	ListAll(ctx context.Context, communityID uuid.UUID) ([]TrainingSchedule, error)
	Update(ctx context.Context, params UpdateTrainingScheduleParams) (*TrainingSchedule, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
