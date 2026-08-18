package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type TrainingScheduleRepository struct {
	q *sqlcgen.Queries
}

func NewTrainingScheduleRepository(q *sqlcgen.Queries) *TrainingScheduleRepository {
	return &TrainingScheduleRepository{q: q}
}

var _ domain.TrainingScheduleRepository = (*TrainingScheduleRepository)(nil)

func toDomainTrainingSchedule(t sqlcgen.TrainingSchedule) *domain.TrainingSchedule {
	return &domain.TrainingSchedule{
		ID:          t.ID,
		CommunityID: t.CommunityID,
		Title:       t.Title,
		DayOfWeek:   int16(t.DayOfWeek),
		StartTime:   pgTimeToString(t.StartTime),
		EndTime:     pgTimeToString(t.EndTime),
		Location:    textToPtr(t.Location),
		IsActive:    t.IsActive,
	}
}

func (r *TrainingScheduleRepository) Create(ctx context.Context, params domain.CreateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
	startTime, err := stringToPgTime(params.StartTime)
	if err != nil {
		return nil, err
	}
	endTime, err := stringToPgTime(params.EndTime)
	if err != nil {
		return nil, err
	}
	t, err := r.q.CreateTrainingSchedule(ctx, sqlcgen.CreateTrainingScheduleParams{
		CommunityID: params.CommunityID,
		Title:       params.Title,
		DayOfWeek:   int32(params.DayOfWeek),
		StartTime:   startTime,
		EndTime:     endTime,
		Location:    ptrToText(params.Location),
		IsActive:    params.IsActive,
	})
	if err != nil {
		return nil, err
	}
	return toDomainTrainingSchedule(t), nil
}

func (r *TrainingScheduleRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.TrainingSchedule, error) {
	t, err := r.q.GetTrainingScheduleByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainTrainingSchedule(t), nil
}

func (r *TrainingScheduleRepository) ListActive(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
	rows, err := r.q.ListActiveTrainingSchedules(ctx, communityID)
	if err != nil {
		return nil, err
	}
	result := make([]domain.TrainingSchedule, 0, len(rows))
	for _, t := range rows {
		result = append(result, *toDomainTrainingSchedule(t))
	}
	return result, nil
}

func (r *TrainingScheduleRepository) ListAll(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
	rows, err := r.q.ListAllTrainingSchedules(ctx, communityID)
	if err != nil {
		return nil, err
	}
	result := make([]domain.TrainingSchedule, 0, len(rows))
	for _, t := range rows {
		result = append(result, *toDomainTrainingSchedule(t))
	}
	return result, nil
}

func (r *TrainingScheduleRepository) Update(ctx context.Context, params domain.UpdateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
	startTime, err := stringToPgTime(params.StartTime)
	if err != nil {
		return nil, err
	}
	endTime, err := stringToPgTime(params.EndTime)
	if err != nil {
		return nil, err
	}
	t, err := r.q.UpdateTrainingSchedule(ctx, sqlcgen.UpdateTrainingScheduleParams{
		ID:        params.ID,
		Title:     params.Title,
		DayOfWeek: int32(params.DayOfWeek),
		StartTime: startTime,
		EndTime:   endTime,
		Location:  ptrToText(params.Location),
		IsActive:  params.IsActive,
	})
	if err != nil {
		return nil, err
	}
	return toDomainTrainingSchedule(t), nil
}

func (r *TrainingScheduleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.q.DeleteTrainingSchedule(ctx, id)
}
