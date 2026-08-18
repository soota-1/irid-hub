package service

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_EventService_GetPublicByID_ReturnsPublicEvent(t *testing.T) {
	id := uuid.New()
	repo := &mockEventRepo{
		getByID: func(ctx context.Context, gotID uuid.UUID) (*domain.Event, error) {
			return &domain.Event{ID: id, IsPublic: true}, nil
		},
	}
	svc := NewEventService(repo)

	got, err := svc.GetPublicByID(context.Background(), id)

	require.NoError(t, err)
	assert.Equal(t, id, got.ID)
}

func Test_EventService_GetPublicByID_HidesPrivateEventFromAnonymousCallers(t *testing.T) {
	repo := &mockEventRepo{
		getByID: func(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
			return &domain.Event{ID: id, IsPublic: false}, nil
		},
	}
	svc := NewEventService(repo)

	_, err := svc.GetPublicByID(context.Background(), uuid.New())

	require.Error(t, err)
	assert.ErrorIs(t, err, ErrNotFound)
}

func Test_EventService_Create_RejectsEndBeforeStart(t *testing.T) {
	repo := &mockEventRepo{
		create: func(ctx context.Context, params domain.CreateEventParams) (*domain.Event, error) {
			t.Fatal("repository should not be called when dates are invalid")
			return nil, nil
		},
	}
	svc := NewEventService(repo)
	start := time.Now()
	end := start.Add(-time.Hour)

	_, err := svc.Create(context.Background(), domain.CreateEventParams{
		Title: "Latihan", Category: domain.EventCategoryTraining, StartAt: start, EndAt: end,
	})

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_EventService_ListPublic_ForcesPublicOnly(t *testing.T) {
	repo := &mockEventRepo{
		list: func(ctx context.Context, params domain.ListEventsParams) ([]domain.Event, int64, error) {
			assert.True(t, params.PublicOnly)
			return []domain.Event{{ID: uuid.New()}}, 1, nil
		},
	}
	svc := NewEventService(repo)

	items, total, err := svc.ListPublic(context.Background(), domain.ListEventsParams{PublicOnly: false})

	require.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, int64(1), total)
}

func Test_EventService_Create_SavesEvent(t *testing.T) {
	want := &domain.Event{ID: uuid.New(), Title: "Latihan"}
	repo := &mockEventRepo{
		create: func(ctx context.Context, params domain.CreateEventParams) (*domain.Event, error) {
			return want, nil
		},
	}
	svc := NewEventService(repo)
	start := time.Now()

	got, err := svc.Create(context.Background(), domain.CreateEventParams{
		Title: "Latihan", Category: domain.EventCategoryTraining, StartAt: start, EndAt: start.Add(time.Hour),
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_EventService_Update_SavesChanges(t *testing.T) {
	want := &domain.Event{ID: uuid.New(), Title: "Updated"}
	repo := &mockEventRepo{
		update: func(ctx context.Context, params domain.UpdateEventParams) (*domain.Event, error) {
			return want, nil
		},
	}
	svc := NewEventService(repo)
	start := time.Now()

	got, err := svc.Update(context.Background(), domain.UpdateEventParams{
		Title: "Updated", Category: domain.EventCategoryTraining, StartAt: start, EndAt: start.Add(time.Hour),
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_EventService_SoftDelete_RemovesEvent(t *testing.T) {
	deleted := false
	repo := &mockEventRepo{
		softDelete: func(ctx context.Context, id uuid.UUID) error {
			deleted = true
			return nil
		},
	}
	svc := NewEventService(repo)

	err := svc.SoftDelete(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.True(t, deleted)
}
