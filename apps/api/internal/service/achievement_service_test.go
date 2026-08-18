package service

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_AchievementService_Create_SavesAchievement(t *testing.T) {
	want := &domain.Achievement{ID: uuid.New(), Title: "Juara 1 Half Marathon"}
	repo := &mockAchievementRepo{
		create: func(ctx context.Context, params domain.CreateAchievementParams) (*domain.Achievement, error) {
			return want, nil
		},
	}
	svc := NewAchievementService(repo)

	got, err := svc.Create(context.Background(), domain.CreateAchievementParams{
		Title: "Juara 1 Half Marathon", AchievedAt: time.Now(),
	})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_AchievementService_Create_RejectsMissingTitle(t *testing.T) {
	repo := &mockAchievementRepo{
		create: func(ctx context.Context, params domain.CreateAchievementParams) (*domain.Achievement, error) {
			t.Fatal("repository should not be called when title is missing")
			return nil, nil
		},
	}
	svc := NewAchievementService(repo)

	_, err := svc.Create(context.Background(), domain.CreateAchievementParams{AchievedAt: time.Now()})

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_AchievementService_List_ReturnsItemsAndTotal(t *testing.T) {
	repo := &mockAchievementRepo{
		list: func(ctx context.Context, params domain.ListAchievementsParams) ([]domain.Achievement, int64, error) {
			return []domain.Achievement{{ID: uuid.New()}}, 1, nil
		},
	}
	svc := NewAchievementService(repo)

	items, total, err := svc.List(context.Background(), domain.ListAchievementsParams{CommunityID: uuid.New()})

	require.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, int64(1), total)
}

func Test_AchievementService_Update_SavesChanges(t *testing.T) {
	want := &domain.Achievement{ID: uuid.New(), Title: "Updated"}
	repo := &mockAchievementRepo{
		update: func(ctx context.Context, params domain.UpdateAchievementParams) (*domain.Achievement, error) {
			return want, nil
		},
	}
	svc := NewAchievementService(repo)

	got, err := svc.Update(context.Background(), domain.UpdateAchievementParams{Title: "Updated", AchievedAt: time.Now()})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_AchievementService_Delete_RemovesAchievement(t *testing.T) {
	deleted := false
	repo := &mockAchievementRepo{
		delete: func(ctx context.Context, id uuid.UUID) error {
			deleted = true
			return nil
		},
	}
	svc := NewAchievementService(repo)

	err := svc.Delete(context.Background(), uuid.New())

	require.NoError(t, err)
	assert.True(t, deleted)
}
