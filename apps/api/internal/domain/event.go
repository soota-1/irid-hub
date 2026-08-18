package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type EventCategory string

const (
	EventCategoryTraining    EventCategory = "training"
	EventCategoryCompetition EventCategory = "competition"
	EventCategorySocial      EventCategory = "social"
	EventCategoryOther       EventCategory = "other"
)

func (c EventCategory) Valid() bool {
	switch c {
	case EventCategoryTraining, EventCategoryCompetition, EventCategorySocial, EventCategoryOther:
		return true
	}
	return false
}

type Event struct {
	ID            uuid.UUID
	CommunityID   uuid.UUID
	Title         string
	Description   *string
	Category      EventCategory
	Location      *string
	StartAt       time.Time
	EndAt         time.Time
	CoverImageURL *string
	IsPublic      bool
	CreatedBy     uuid.UUID
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type CreateEventParams struct {
	CommunityID   uuid.UUID
	Title         string
	Description   *string
	Category      EventCategory
	Location      *string
	StartAt       time.Time
	EndAt         time.Time
	CoverImageURL *string
	IsPublic      bool
	CreatedBy     uuid.UUID
}

type UpdateEventParams struct {
	ID            uuid.UUID
	Title         string
	Description   *string
	Category      EventCategory
	Location      *string
	StartAt       time.Time
	EndAt         time.Time
	CoverImageURL *string
	IsPublic      bool
}

type ListEventsParams struct {
	CommunityID uuid.UUID
	PublicOnly  bool
	From        *time.Time
	To          *time.Time
	Page        int
	PerPage     int
}

type EventRepository interface {
	Create(ctx context.Context, params CreateEventParams) (*Event, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Event, error)
	List(ctx context.Context, params ListEventsParams) ([]Event, int64, error)
	Update(ctx context.Context, params UpdateEventParams) (*Event, error)
	SoftDelete(ctx context.Context, id uuid.UUID) error
}

type EventRsvpStatus string

const (
	EventRsvpGoing    EventRsvpStatus = "going"
	EventRsvpNotGoing EventRsvpStatus = "not_going"
	EventRsvpMaybe    EventRsvpStatus = "maybe"
)

func (s EventRsvpStatus) Valid() bool {
	switch s {
	case EventRsvpGoing, EventRsvpNotGoing, EventRsvpMaybe:
		return true
	}
	return false
}

type EventRsvp struct {
	ID          uuid.UUID
	EventID     uuid.UUID
	UserID      uuid.UUID
	Status      EventRsvpStatus
	RespondedAt time.Time
}

type EventRsvpRepository interface {
	Upsert(ctx context.Context, eventID, userID uuid.UUID, status EventRsvpStatus) (*EventRsvp, error)
	GetByEventAndUser(ctx context.Context, eventID, userID uuid.UUID) (*EventRsvp, error)
}
