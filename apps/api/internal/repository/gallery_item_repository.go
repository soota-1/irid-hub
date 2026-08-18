package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type GalleryRepository struct {
	q *sqlcgen.Queries
}

func NewGalleryRepository(q *sqlcgen.Queries) *GalleryRepository {
	return &GalleryRepository{q: q}
}

var _ domain.GalleryRepository = (*GalleryRepository)(nil)

func toDomainGalleryItem(g sqlcgen.GalleryItem) *domain.GalleryItem {
	return &domain.GalleryItem{
		ID:           g.ID,
		CommunityID:  g.CommunityID,
		Type:         domain.GalleryItemType(g.Type),
		MediaURL:     g.MediaUrl,
		ThumbnailURL: textToPtr(g.ThumbnailUrl),
		Caption:      textToPtr(g.Caption),
		EventID:      uuidToPtr(g.EventID),
		UploadedBy:   g.UploadedBy,
		CreatedAt:    tsToTime(g.CreatedAt),
	}
}

func (r *GalleryRepository) Create(ctx context.Context, params domain.CreateGalleryItemParams) (*domain.GalleryItem, error) {
	g, err := r.q.CreateGalleryItem(ctx, sqlcgen.CreateGalleryItemParams{
		CommunityID:  params.CommunityID,
		Type:         string(params.Type),
		MediaUrl:     params.MediaURL,
		ThumbnailUrl: ptrToText(params.ThumbnailURL),
		Caption:      ptrToText(params.Caption),
		EventID:      ptrToUUID(params.EventID),
		UploadedBy:   params.UploadedBy,
	})
	if err != nil {
		return nil, err
	}
	return toDomainGalleryItem(g), nil
}

func (r *GalleryRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.GalleryItem, error) {
	g, err := r.q.GetGalleryItemByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainGalleryItem(g), nil
}

func (r *GalleryRepository) List(ctx context.Context, params domain.ListGalleryItemsParams) ([]domain.GalleryItem, int64, error) {
	eventFilter := ptrToUUID(params.EventID)

	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListGalleryItems(ctx, sqlcgen.ListGalleryItemsParams{
		CommunityID: params.CommunityID,
		EventID:     eventFilter,
		PageLimit:   int32(params.PerPage),
		PageOffset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountGalleryItems(ctx, sqlcgen.CountGalleryItemsParams{
		CommunityID: params.CommunityID,
		EventID:     eventFilter,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.GalleryItem, 0, len(rows))
	for _, g := range rows {
		result = append(result, *toDomainGalleryItem(g))
	}
	return result, total, nil
}

func (r *GalleryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.q.DeleteGalleryItem(ctx, id)
}
