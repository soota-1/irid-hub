package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_GalleryService_PresignUpload_ReturnsUploadURLForAllowedType(t *testing.T) {
	storage := &mockGalleryStorage{
		presignUpload: func(ctx context.Context, objectKey, contentType string) (string, error) {
			return "https://r2.example.com/" + objectKey, nil
		},
		publicURL: func(objectKey string) string {
			return "https://pub.example.com/" + objectKey
		},
	}
	svc := NewGalleryService(&mockGalleryRepo{}, storage)

	got, err := svc.PresignUpload(context.Background(), uuid.New(), "image/jpeg", 1024)

	require.NoError(t, err)
	assert.NotEmpty(t, got.UploadURL)
	assert.NotEmpty(t, got.ObjectKey)
	assert.NotEmpty(t, got.PublicURL)
}

func Test_GalleryService_PresignUpload_RejectsDisallowedContentType(t *testing.T) {
	storage := &mockGalleryStorage{
		presignUpload: func(ctx context.Context, objectKey, contentType string) (string, error) {
			t.Fatal("storage should not be called for a disallowed content type")
			return "", nil
		},
	}
	svc := NewGalleryService(&mockGalleryRepo{}, storage)

	_, err := svc.PresignUpload(context.Background(), uuid.New(), "application/pdf", 1024)

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_GalleryService_List_ReturnsItemsAndTotal(t *testing.T) {
	repo := &mockGalleryRepo{
		list: func(ctx context.Context, params domain.ListGalleryItemsParams) ([]domain.GalleryItem, int64, error) {
			return []domain.GalleryItem{{ID: uuid.New()}}, 1, nil
		},
	}
	svc := NewGalleryService(repo, &mockGalleryStorage{})

	items, total, err := svc.List(context.Background(), domain.ListGalleryItemsParams{CommunityID: uuid.New()})

	require.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, int64(1), total)
}

func Test_GalleryService_Create_SavesMetadataAfterUpload(t *testing.T) {
	want := &domain.GalleryItem{ID: uuid.New(), MediaURL: "https://r2.example.com/gallery/x"}
	repo := &mockGalleryRepo{
		create: func(ctx context.Context, params domain.CreateGalleryItemParams) (*domain.GalleryItem, error) {
			return want, nil
		},
	}
	svc := NewGalleryService(repo, &mockGalleryStorage{})

	got, err := svc.Create(context.Background(), domain.CreateGalleryItemParams{
		Type: domain.GalleryItemPhoto, MediaURL: "https://r2.example.com/gallery/x",
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_GalleryService_Create_RejectsMissingMediaURL(t *testing.T) {
	repo := &mockGalleryRepo{
		create: func(ctx context.Context, params domain.CreateGalleryItemParams) (*domain.GalleryItem, error) {
			t.Fatal("repository should not be called when media_url is missing")
			return nil, nil
		},
	}
	svc := NewGalleryService(repo, &mockGalleryStorage{})

	_, err := svc.Create(context.Background(), domain.CreateGalleryItemParams{Type: domain.GalleryItemPhoto})

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_GalleryService_Delete_RemovesItem(t *testing.T) {
	deleted := false
	repo := &mockGalleryRepo{
		delete: func(ctx context.Context, id uuid.UUID) error {
			deleted = true
			return nil
		},
	}
	svc := NewGalleryService(repo, &mockGalleryStorage{})

	err := svc.Delete(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.True(t, deleted)
}

func Test_GalleryService_PresignUpload_RejectsFileTooLarge(t *testing.T) {
	storage := &mockGalleryStorage{
		presignUpload: func(ctx context.Context, objectKey, contentType string) (string, error) {
			t.Fatal("storage should not be called when file exceeds the size limit")
			return "", nil
		},
	}
	svc := NewGalleryService(&mockGalleryRepo{}, storage)

	_, err := svc.PresignUpload(context.Background(), uuid.New(), "image/jpeg", 50*1024*1024)

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}
