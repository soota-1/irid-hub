package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

// GalleryStorage is the port the service depends on; storage.R2Client
// satisfies it structurally (Rules.md §4: service must not know infra
// details, only the interface it needs).
type GalleryStorage interface {
	PresignUpload(ctx context.Context, objectKey, contentType string) (string, error)
	PublicURL(objectKey string) string
	Delete(ctx context.Context, objectKey string) error
}

const (
	maxPhotoBytes = 20 * 1024 * 1024  // 20MB
	maxVideoBytes = 100 * 1024 * 1024 // 100MB
)

var allowedContentTypes = map[string]domain.GalleryItemType{
	"image/jpeg": domain.GalleryItemPhoto,
	"image/png":  domain.GalleryItemPhoto,
	"image/webp": domain.GalleryItemPhoto,
	"video/mp4":  domain.GalleryItemVideo,
}

type GalleryService struct {
	repo    domain.GalleryRepository
	storage GalleryStorage
}

func NewGalleryService(repo domain.GalleryRepository, storage GalleryStorage) *GalleryService {
	return &GalleryService{repo: repo, storage: storage}
}

func (s *GalleryService) List(ctx context.Context, params domain.ListGalleryItemsParams) ([]domain.GalleryItem, int64, error) {
	params.Page, params.PerPage = normalizePage(params.Page, params.PerPage)
	items, total, err := s.repo.List(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list gallery items: %w", err)
	}
	return items, total, nil
}

type PresignedUpload struct {
	UploadURL string
	ObjectKey string
	// PublicURL is where the object will be reachable once uploaded —
	// the client needs this to call Create() afterwards, since only the
	// backend knows the R2 public base URL (R2_PUBLIC_URL).
	PublicURL string
}

// PresignUpload validates the file type/size against the allow-list
// *before* issuing a presigned URL — Task.md Phase 1.9, Rules.md §6.
func (s *GalleryService) PresignUpload(ctx context.Context, communityID uuid.UUID, contentType string, sizeBytes int64) (*PresignedUpload, error) {
	itemType, ok := allowedContentTypes[contentType]
	if !ok {
		return nil, &ValidationErr{Fields: map[string]string{"content_type": "tipe file tidak diizinkan"}}
	}
	maxBytes := int64(maxPhotoBytes)
	if itemType == domain.GalleryItemVideo {
		maxBytes = maxVideoBytes
	}
	if sizeBytes <= 0 || sizeBytes > maxBytes {
		return nil, &ValidationErr{Fields: map[string]string{"size_bytes": "ukuran file melebihi batas yang diizinkan"}}
	}

	objectKey := fmt.Sprintf("gallery/%s/%s", communityID, uuid.NewString())
	uploadURL, err := s.storage.PresignUpload(ctx, objectKey, contentType)
	if err != nil {
		return nil, fmt.Errorf("presign gallery upload: %w", err)
	}
	return &PresignedUpload{UploadURL: uploadURL, ObjectKey: objectKey, PublicURL: s.storage.PublicURL(objectKey)}, nil
}

func (s *GalleryService) Create(ctx context.Context, params domain.CreateGalleryItemParams) (*domain.GalleryItem, error) {
	if !params.Type.Valid() {
		return nil, &ValidationErr{Fields: map[string]string{"type": "harus salah satu dari: photo, video"}}
	}
	if params.MediaURL == "" {
		return nil, &ValidationErr{Fields: map[string]string{"media_url": "wajib diisi"}}
	}
	item, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create gallery item: %w", err)
	}
	return item, nil
}

func (s *GalleryService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete gallery item: %w", wrapNotFound(err))
	}
	return nil
}
