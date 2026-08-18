package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type EventService struct {
	repo domain.EventRepository
}

func NewEventService(repo domain.EventRepository) *EventService {
	return &EventService{repo: repo}
}

// ListPublic always forces public_only regardless of the caller's input —
// this is the endpoint anonymous visitors hit.
func (s *EventService) ListPublic(ctx context.Context, params domain.ListEventsParams) ([]domain.Event, int64, error) {
	params.PublicOnly = true
	params.Page, params.PerPage = normalizePage(params.Page, params.PerPage)
	items, total, err := s.repo.List(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list public events: %w", err)
	}
	return items, total, nil
}

// ListForAdmin returns events regardless of is_public — the admin panel
// needs to see and manage private events too — Task.md Phase 2.4.
func (s *EventService) ListForAdmin(ctx context.Context, params domain.ListEventsParams) ([]domain.Event, int64, error) {
	params.PublicOnly = false
	params.Page, params.PerPage = normalizePage(params.Page, params.PerPage)
	items, total, err := s.repo.List(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list events for admin: %w", err)
	}
	return items, total, nil
}

// GetPublicByID hides private events from anonymous callers by returning
// ErrNotFound instead of leaking their existence.
func (s *EventService) GetPublicByID(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
	e, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get event: %w", wrapNotFound(err))
	}
	if !e.IsPublic {
		return nil, fmt.Errorf("event is not public: %w", ErrNotFound)
	}
	return e, nil
}

func (s *EventService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
	e, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get event: %w", wrapNotFound(err))
	}
	return e, nil
}

func (s *EventService) Create(ctx context.Context, params domain.CreateEventParams) (*domain.Event, error) {
	if err := validateEventFields(params.Title, params.Category, params.StartAt, params.EndAt); err != nil {
		return nil, err
	}
	e, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create event: %w", err)
	}
	return e, nil
}

func (s *EventService) Update(ctx context.Context, params domain.UpdateEventParams) (*domain.Event, error) {
	if err := validateEventFields(params.Title, params.Category, params.StartAt, params.EndAt); err != nil {
		return nil, err
	}
	e, err := s.repo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update event: %w", wrapNotFound(err))
	}
	return e, nil
}

func (s *EventService) SoftDelete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id); err != nil {
		return fmt.Errorf("delete event: %w", wrapNotFound(err))
	}
	return nil
}

func validateEventFields(title string, category domain.EventCategory, startAt, endAt time.Time) error {
	fields := map[string]string{}
	if title == "" {
		fields["title"] = "wajib diisi"
	}
	if !category.Valid() {
		fields["category"] = "harus salah satu dari: training, competition, social, other"
	}
	if startAt.IsZero() {
		fields["start_at"] = "wajib diisi"
	}
	if endAt.IsZero() {
		fields["end_at"] = "wajib diisi"
	} else if !startAt.IsZero() && endAt.Before(startAt) {
		fields["end_at"] = "harus setelah start_at"
	}
	if len(fields) > 0 {
		return &ValidationErr{Fields: fields}
	}
	return nil
}
