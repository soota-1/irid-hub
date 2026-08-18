//go:build integration

package repository

import (
	"context"
	"testing"
	"time"

	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_Integration_GalleryRepository_List_FiltersByEventID(t *testing.T) {
	galleryRepo := NewGalleryRepository(testQueries)
	eventRepo := NewEventRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()
	now := time.Now().UTC().Truncate(time.Second)

	event, err := eventRepo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Event", Category: domain.EventCategorySocial,
		StartAt: now, EndAt: now.Add(time.Hour), IsPublic: true, CreatedBy: user.ID,
	})
	require.NoError(t, err)

	linked, err := galleryRepo.Create(ctx, domain.CreateGalleryItemParams{
		CommunityID: communityID, Type: domain.GalleryItemPhoto, MediaURL: "https://r2.example.com/a.jpg",
		EventID: &event.ID, UploadedBy: user.ID,
	})
	require.NoError(t, err)
	_, err = galleryRepo.Create(ctx, domain.CreateGalleryItemParams{
		CommunityID: communityID, Type: domain.GalleryItemPhoto, MediaURL: "https://r2.example.com/b.jpg",
		UploadedBy: user.ID,
	})
	require.NoError(t, err)

	items, total, err := galleryRepo.List(ctx, domain.ListGalleryItemsParams{CommunityID: communityID, EventID: &event.ID, Page: 1, PerPage: 20})

	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, items, 1)
	assert.Equal(t, linked.ID, items[0].ID)
}

func Test_Integration_GalleryRepository_Delete_RemovesItem(t *testing.T) {
	repo := NewGalleryRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()

	item, err := repo.Create(ctx, domain.CreateGalleryItemParams{
		CommunityID: communityID, Type: domain.GalleryItemVideo, MediaURL: "https://r2.example.com/c.mp4", UploadedBy: user.ID,
	})
	require.NoError(t, err)

	require.NoError(t, repo.Delete(ctx, item.ID))

	_, err = repo.GetByID(ctx, item.ID)
	assert.Error(t, err)
}
