package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type AnnouncementRepository struct {
	q *sqlcgen.Queries
}

func NewAnnouncementRepository(q *sqlcgen.Queries) *AnnouncementRepository {
	return &AnnouncementRepository{q: q}
}

var _ domain.AnnouncementRepository = (*AnnouncementRepository)(nil)

func toDomainAnnouncement(a sqlcgen.Announcement) *domain.Announcement {
	return &domain.Announcement{
		ID:          a.ID,
		CommunityID: a.CommunityID,
		Title:       a.Title,
		Content:     a.Content,
		Urgency:     domain.AnnouncementUrgency(a.Urgency),
		Visibility:  domain.AnnouncementVisibility(a.Visibility),
		PublishedAt: tsToTimePtr(a.PublishedAt),
		CreatedBy:   a.CreatedBy,
		CreatedAt:   tsToTime(a.CreatedAt),
		UpdatedAt:   tsToTime(a.UpdatedAt),
	}
}

func (r *AnnouncementRepository) Create(ctx context.Context, params domain.CreateAnnouncementParams) (*domain.Announcement, error) {
	a, err := r.q.CreateAnnouncement(ctx, sqlcgen.CreateAnnouncementParams{
		CommunityID: params.CommunityID,
		Title:       params.Title,
		Content:     params.Content,
		Urgency:     string(params.Urgency),
		Visibility:  string(params.Visibility),
		PublishedAt: timePtrToTs(params.PublishedAt),
		CreatedBy:   params.CreatedBy,
	})
	if err != nil {
		return nil, err
	}
	return toDomainAnnouncement(a), nil
}

func (r *AnnouncementRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Announcement, error) {
	a, err := r.q.GetAnnouncementByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainAnnouncement(a), nil
}

func (r *AnnouncementRepository) List(ctx context.Context, params domain.ListAnnouncementsParams) ([]domain.Announcement, int64, error) {
	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListAnnouncements(ctx, sqlcgen.ListAnnouncementsParams{
		CommunityID:    params.CommunityID,
		IncludeMembers: params.IncludeMembers,
		PageLimit:      int32(params.PerPage),
		PageOffset:     int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountAnnouncements(ctx, sqlcgen.CountAnnouncementsParams{
		CommunityID:    params.CommunityID,
		IncludeMembers: params.IncludeMembers,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.Announcement, 0, len(rows))
	for _, a := range rows {
		result = append(result, *toDomainAnnouncement(a))
	}
	return result, total, nil
}

func (r *AnnouncementRepository) ListAll(ctx context.Context, params domain.ListAllAnnouncementsParams) ([]domain.Announcement, int64, error) {
	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListAllAnnouncements(ctx, sqlcgen.ListAllAnnouncementsParams{
		CommunityID: params.CommunityID,
		PageLimit:   int32(params.PerPage),
		PageOffset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountAllAnnouncements(ctx, params.CommunityID)
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.Announcement, 0, len(rows))
	for _, a := range rows {
		result = append(result, *toDomainAnnouncement(a))
	}
	return result, total, nil
}

func (r *AnnouncementRepository) Update(ctx context.Context, params domain.UpdateAnnouncementParams) (*domain.Announcement, error) {
	a, err := r.q.UpdateAnnouncement(ctx, sqlcgen.UpdateAnnouncementParams{
		ID:          params.ID,
		Title:       params.Title,
		Content:     params.Content,
		Urgency:     string(params.Urgency),
		Visibility:  string(params.Visibility),
		PublishedAt: timePtrToTs(params.PublishedAt),
	})
	if err != nil {
		return nil, err
	}
	return toDomainAnnouncement(a), nil
}

func (r *AnnouncementRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.q.DeleteAnnouncement(ctx, id)
}
