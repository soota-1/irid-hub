package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_AnnouncementService_ListInternal_IncludesMembersOnly(t *testing.T) {
	communityID := uuid.New()
	repo := &mockAnnouncementRepo{
		list: func(ctx context.Context, params domain.ListAnnouncementsParams) ([]domain.Announcement, int64, error) {
			assert.True(t, params.IncludeMembers)
			return []domain.Announcement{{ID: uuid.New(), Visibility: domain.AnnouncementVisibilityMembersOnly}}, 1, nil
		},
	}
	svc := NewAnnouncementService(repo)

	items, total, err := svc.ListInternal(context.Background(), communityID, 1, 20)

	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	assert.Len(t, items, 1)
}

func Test_AnnouncementService_Create_RejectsInvalidUrgency(t *testing.T) {
	repo := &mockAnnouncementRepo{
		create: func(ctx context.Context, params domain.CreateAnnouncementParams) (*domain.Announcement, error) {
			t.Fatal("repository should not be called when urgency is invalid")
			return nil, nil
		},
	}
	svc := NewAnnouncementService(repo)

	_, err := svc.Create(context.Background(), domain.CreateAnnouncementParams{
		Title: "Info", Content: "isi", Urgency: domain.AnnouncementUrgency("critical"), Visibility: domain.AnnouncementVisibilityPublic,
	})

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_AnnouncementService_ListPublic_ExcludesMembersOnly(t *testing.T) {
	repo := &mockAnnouncementRepo{
		list: func(ctx context.Context, params domain.ListAnnouncementsParams) ([]domain.Announcement, int64, error) {
			assert.False(t, params.IncludeMembers)
			return []domain.Announcement{{ID: uuid.New()}}, 1, nil
		},
	}
	svc := NewAnnouncementService(repo)

	items, total, err := svc.ListPublic(context.Background(), uuid.New(), 1, 20)

	require.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, int64(1), total)
}

func Test_AnnouncementService_Create_SavesAnnouncement(t *testing.T) {
	want := &domain.Announcement{ID: uuid.New(), Title: "Info"}
	repo := &mockAnnouncementRepo{
		create: func(ctx context.Context, params domain.CreateAnnouncementParams) (*domain.Announcement, error) {
			return want, nil
		},
	}
	svc := NewAnnouncementService(repo)

	got, err := svc.Create(context.Background(), domain.CreateAnnouncementParams{
		Title: "Info", Content: "isi", Urgency: domain.AnnouncementUrgencyInfo, Visibility: domain.AnnouncementVisibilityPublic,
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_AnnouncementService_Update_SavesChanges(t *testing.T) {
	want := &domain.Announcement{ID: uuid.New(), Title: "Updated"}
	repo := &mockAnnouncementRepo{
		update: func(ctx context.Context, params domain.UpdateAnnouncementParams) (*domain.Announcement, error) {
			return want, nil
		},
	}
	svc := NewAnnouncementService(repo)

	got, err := svc.Update(context.Background(), domain.UpdateAnnouncementParams{
		Title: "Updated", Content: "isi", Urgency: domain.AnnouncementUrgencyInfo, Visibility: domain.AnnouncementVisibilityPublic,
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_AnnouncementService_Delete_RemovesAnnouncement(t *testing.T) {
	deleted := false
	repo := &mockAnnouncementRepo{
		delete: func(ctx context.Context, id uuid.UUID) error {
			deleted = true
			return nil
		},
	}
	svc := NewAnnouncementService(repo)

	err := svc.Delete(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.True(t, deleted)
}
