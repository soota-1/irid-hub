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

func Test_Integration_AchievementRepository_List_OrdersByAchievedAtDescending(t *testing.T) {
	repo := NewAchievementRepository(testQueries)
	communityID := mustCreateCommunity(t)
	ctx := context.Background()

	older, err := repo.Create(ctx, domain.CreateAchievementParams{
		CommunityID: communityID, Title: "2024", AchievedAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
	})
	require.NoError(t, err)
	newer, err := repo.Create(ctx, domain.CreateAchievementParams{
		CommunityID: communityID, Title: "2026", AchievedAt: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
	})
	require.NoError(t, err)

	items, total, err := repo.List(ctx, domain.ListAchievementsParams{CommunityID: communityID, Page: 1, PerPage: 20})

	require.NoError(t, err)
	assert.Equal(t, int64(2), total)
	require.Len(t, items, 2)
	assert.Equal(t, newer.ID, items[0].ID)
	assert.Equal(t, older.ID, items[1].ID)
}

func Test_Integration_AchievementRepository_Create_AllowsNilMemberID(t *testing.T) {
	repo := NewAchievementRepository(testQueries)
	communityID := mustCreateCommunity(t)
	ctx := context.Background()

	a, err := repo.Create(ctx, domain.CreateAchievementParams{
		CommunityID: communityID, Title: "Prestasi komunitas", AchievedAt: time.Now(), MemberID: nil,
	})

	require.NoError(t, err)
	assert.Nil(t, a.MemberID)
}
