package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type EventRsvpRepository struct {
	q *sqlcgen.Queries
}

func NewEventRsvpRepository(q *sqlcgen.Queries) *EventRsvpRepository {
	return &EventRsvpRepository{q: q}
}

var _ domain.EventRsvpRepository = (*EventRsvpRepository)(nil)

func toDomainEventRsvp(r sqlcgen.EventRsvp) *domain.EventRsvp {
	return &domain.EventRsvp{
		ID:          r.ID,
		EventID:     r.EventID,
		UserID:      r.UserID,
		Status:      domain.EventRsvpStatus(r.Status),
		RespondedAt: tsToTime(r.RespondedAt),
	}
}

func (r *EventRsvpRepository) Upsert(ctx context.Context, eventID, userID uuid.UUID, status domain.EventRsvpStatus) (*domain.EventRsvp, error) {
	rsvp, err := r.q.UpsertEventRsvp(ctx, sqlcgen.UpsertEventRsvpParams{
		EventID: eventID,
		UserID:  userID,
		Status:  string(status),
	})
	if err != nil {
		return nil, err
	}
	return toDomainEventRsvp(rsvp), nil
}

func (r *EventRsvpRepository) GetByEventAndUser(ctx context.Context, eventID, userID uuid.UUID) (*domain.EventRsvp, error) {
	rsvp, err := r.q.GetEventRsvpByEventAndUser(ctx, sqlcgen.GetEventRsvpByEventAndUserParams{
		EventID: eventID,
		UserID:  userID,
	})
	if err != nil {
		return nil, err
	}
	return toDomainEventRsvp(rsvp), nil
}
