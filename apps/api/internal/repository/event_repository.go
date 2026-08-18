package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type EventRepository struct {
	q *sqlcgen.Queries
}

func NewEventRepository(q *sqlcgen.Queries) *EventRepository {
	return &EventRepository{q: q}
}

var _ domain.EventRepository = (*EventRepository)(nil)

func toDomainEvent(e sqlcgen.Event) *domain.Event {
	return &domain.Event{
		ID:            e.ID,
		CommunityID:   e.CommunityID,
		Title:         e.Title,
		Description:   textToPtr(e.Description),
		Category:      domain.EventCategory(e.Category),
		Location:      textToPtr(e.Location),
		StartAt:       tsToTime(e.StartAt),
		EndAt:         tsToTime(e.EndAt),
		CoverImageURL: textToPtr(e.CoverImageUrl),
		IsPublic:      e.IsPublic,
		CreatedBy:     e.CreatedBy,
		CreatedAt:     tsToTime(e.CreatedAt),
		UpdatedAt:     tsToTime(e.UpdatedAt),
	}
}

func (r *EventRepository) Create(ctx context.Context, params domain.CreateEventParams) (*domain.Event, error) {
	e, err := r.q.CreateEvent(ctx, sqlcgen.CreateEventParams{
		CommunityID:   params.CommunityID,
		Title:         params.Title,
		Description:   ptrToText(params.Description),
		Category:      string(params.Category),
		Location:      ptrToText(params.Location),
		StartAt:       timeToTs(params.StartAt),
		EndAt:         timeToTs(params.EndAt),
		CoverImageUrl: ptrToText(params.CoverImageURL),
		IsPublic:      params.IsPublic,
		CreatedBy:     params.CreatedBy,
	})
	if err != nil {
		return nil, err
	}
	return toDomainEvent(e), nil
}

func (r *EventRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
	e, err := r.q.GetEventByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainEvent(e), nil
}

func (r *EventRepository) List(ctx context.Context, params domain.ListEventsParams) ([]domain.Event, int64, error) {
	fromDate := pgtype.Timestamptz{}
	if params.From != nil {
		fromDate = timeToTs(*params.From)
	}
	toDate := pgtype.Timestamptz{}
	if params.To != nil {
		toDate = timeToTs(*params.To)
	}

	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListEvents(ctx, sqlcgen.ListEventsParams{
		CommunityID: params.CommunityID,
		PublicOnly:  params.PublicOnly,
		FromDate:    fromDate,
		ToDate:      toDate,
		PageLimit:   int32(params.PerPage),
		PageOffset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountEvents(ctx, sqlcgen.CountEventsParams{
		CommunityID: params.CommunityID,
		PublicOnly:  params.PublicOnly,
		FromDate:    fromDate,
		ToDate:      toDate,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.Event, 0, len(rows))
	for _, e := range rows {
		result = append(result, *toDomainEvent(e))
	}
	return result, total, nil
}

func (r *EventRepository) Update(ctx context.Context, params domain.UpdateEventParams) (*domain.Event, error) {
	e, err := r.q.UpdateEvent(ctx, sqlcgen.UpdateEventParams{
		ID:            params.ID,
		Title:         params.Title,
		Description:   ptrToText(params.Description),
		Category:      string(params.Category),
		Location:      ptrToText(params.Location),
		StartAt:       timeToTs(params.StartAt),
		EndAt:         timeToTs(params.EndAt),
		CoverImageUrl: ptrToText(params.CoverImageURL),
		IsPublic:      params.IsPublic,
	})
	if err != nil {
		return nil, err
	}
	return toDomainEvent(e), nil
}

func (r *EventRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	return r.q.SoftDeleteEvent(ctx, id)
}
