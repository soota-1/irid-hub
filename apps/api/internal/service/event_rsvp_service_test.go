package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_EventRsvpService_Upsert_SavesRsvp(t *testing.T) {
	eventID, userID := uuid.New(), uuid.New()
	eventRepo := &mockEventRepo{
		getByID: func(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
			return &domain.Event{ID: eventID}, nil
		},
	}
	rsvpRepo := &mockEventRsvpRepo{
		upsert: func(ctx context.Context, gotEventID, gotUserID uuid.UUID, status domain.EventRsvpStatus) (*domain.EventRsvp, error) {
			return &domain.EventRsvp{EventID: gotEventID, UserID: gotUserID, Status: status}, nil
		},
	}
	svc := NewEventRsvpService(rsvpRepo, eventRepo)

	got, err := svc.Upsert(context.Background(), eventID, userID, domain.EventRsvpGoing)

	require.NoError(t, err)
	assert.Equal(t, domain.EventRsvpGoing, got.Status)
}

func Test_EventRsvpService_Upsert_RejectsInvalidStatus(t *testing.T) {
	rsvpRepo := &mockEventRsvpRepo{
		upsert: func(ctx context.Context, eventID, userID uuid.UUID, status domain.EventRsvpStatus) (*domain.EventRsvp, error) {
			t.Fatal("repository should not be called when status is invalid")
			return nil, nil
		},
	}
	eventRepo := &mockEventRepo{}
	svc := NewEventRsvpService(rsvpRepo, eventRepo)

	_, err := svc.Upsert(context.Background(), uuid.New(), uuid.New(), domain.EventRsvpStatus("interested"))

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}
