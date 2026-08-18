package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type GalleryItemType string

const (
	GalleryItemPhoto GalleryItemType = "photo"
	GalleryItemVideo GalleryItemType = "video"
)

func (t GalleryItemType) Valid() bool {
	switch t {
	case GalleryItemPhoto, GalleryItemVideo:
		return true
	}
	return false
}

type GalleryItem struct {
	ID           uuid.UUID
	CommunityID  uuid.UUID
	Type         GalleryItemType
	MediaURL     string
	ThumbnailURL *string
	Caption      *string
	EventID      *uuid.UUID
	UploadedBy   uuid.UUID
	CreatedAt    time.Time
}

type CreateGalleryItemParams struct {
	CommunityID  uuid.UUID
	Type         GalleryItemType
	MediaURL     string
	ThumbnailURL *string
	Caption      *string
	EventID      *uuid.UUID
	UploadedBy   uuid.UUID
}

type ListGalleryItemsParams struct {
	CommunityID uuid.UUID
	EventID     *uuid.UUID
	Page        int
	PerPage     int
}

type GalleryRepository interface {
	Create(ctx context.Context, params CreateGalleryItemParams) (*GalleryItem, error)
	GetByID(ctx context.Context, id uuid.UUID) (*GalleryItem, error)
	List(ctx context.Context, params ListGalleryItemsParams) ([]GalleryItem, int64, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
