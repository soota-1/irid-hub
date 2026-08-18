package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type EventRsvpService struct {
	repo      domain.EventRsvpRepository
	eventRepo domain.EventRepository
}

func NewEventRsvpService(repo domain.EventRsvpRepository, eventRepo domain.EventRepository) *EventRsvpService {
	return &EventRsvpService{repo: repo, eventRepo: eventRepo}
}

func (s *EventRsvpService) Upsert(ctx context.Context, eventID, userID uuid.UUID, status domain.EventRsvpStatus) (*domain.EventRsvp, error) {
	if !status.Valid() {
		return nil, &ValidationErr{Fields: map[string]string{"status": "harus salah satu dari: going, not_going, maybe"}}
	}
	if _, err := s.eventRepo.GetByID(ctx, eventID); err != nil {
		return nil, fmt.Errorf("get event: %w", wrapNotFound(err))
	}

	rsvp, err := s.repo.Upsert(ctx, eventID, userID, status)
	if err != nil {
		return nil, fmt.Errorf("upsert rsvp: %w", err)
	}
	return rsvp, nil
}
