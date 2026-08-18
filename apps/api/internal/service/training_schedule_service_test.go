package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_TrainingScheduleService_Create_SavesSchedule(t *testing.T) {
	want := &domain.TrainingSchedule{ID: uuid.New(), Title: "Latihan Rutin Selasa", DayOfWeek: 2}
	repo := &mockTrainingScheduleRepo{
		create: func(ctx context.Context, params domain.CreateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
			return want, nil
		},
	}
	svc := NewTrainingScheduleService(repo)

	got, err := svc.Create(context.Background(), domain.CreateTrainingScheduleParams{
		Title: "Latihan Rutin Selasa", DayOfWeek: 2, StartTime: "18:00:00", EndTime: "20:00:00",
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_TrainingScheduleService_Create_RejectsDayOfWeekOutOfRange(t *testing.T) {
	repo := &mockTrainingScheduleRepo{
		create: func(ctx context.Context, params domain.CreateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
			t.Fatal("repository should not be called when day_of_week is invalid")
			return nil, nil
		},
	}
	svc := NewTrainingScheduleService(repo)

	_, err := svc.Create(context.Background(), domain.CreateTrainingScheduleParams{
		Title: "Latihan", DayOfWeek: 7, StartTime: "18:00:00", EndTime: "20:00:00",
	})

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_TrainingScheduleService_ListActive_ReturnsSchedules(t *testing.T) {
	repo := &mockTrainingScheduleRepo{
		listActive: func(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
			return []domain.TrainingSchedule{{ID: uuid.New(), IsActive: true}}, nil
		},
	}
	svc := NewTrainingScheduleService(repo)

	items, err := svc.ListActive(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.Len(t, items, 1)
}

func Test_TrainingScheduleService_ListAll_IncludesInactive(t *testing.T) {
	repo := &mockTrainingScheduleRepo{
		listAll: func(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
			return []domain.TrainingSchedule{{ID: uuid.New(), IsActive: false}}, nil
		},
	}
	svc := NewTrainingScheduleService(repo)

	items, err := svc.ListAll(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.Len(t, items, 1)
}

func Test_TrainingScheduleService_Update_SavesChanges(t *testing.T) {
	want := &domain.TrainingSchedule{ID: uuid.New(), Title: "Updated"}
	repo := &mockTrainingScheduleRepo{
		update: func(ctx context.Context, params domain.UpdateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
			return want, nil
		},
	}
	svc := NewTrainingScheduleService(repo)

	got, err := svc.Update(context.Background(), domain.UpdateTrainingScheduleParams{
		Title: "Updated", DayOfWeek: 2, StartTime: "18:00:00", EndTime: "20:00:00",
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_TrainingScheduleService_Delete_RemovesSchedule(t *testing.T) {
	deleted := false
	repo := &mockTrainingScheduleRepo{
		delete: func(ctx context.Context, id uuid.UUID) error {
			deleted = true
			return nil
		},
	}
	svc := NewTrainingScheduleService(repo)

	err := svc.Delete(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.True(t, deleted)
}
