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

func Test_Integration_EventRepository_SoftDelete_HidesFromGetByID(t *testing.T) {
	repo := NewEventRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()
	now := time.Now().UTC().Truncate(time.Second)

	e, err := repo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Latihan", Category: domain.EventCategoryTraining,
		StartAt: now, EndAt: now.Add(time.Hour), IsPublic: true, CreatedBy: user.ID,
	})
	require.NoError(t, err)

	require.NoError(t, repo.SoftDelete(ctx, e.ID))

	_, err = repo.GetByID(ctx, e.ID)
	assert.Error(t, err, "a soft-deleted event must not be retrievable via GetByID")
}

func Test_Integration_EventRepository_List_FiltersByDateRangeAndPublicOnly(t *testing.T) {
	repo := NewEventRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()
	base := time.Now().UTC().Truncate(time.Second)

	inRangePublic, err := repo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Public in range", Category: domain.EventCategorySocial,
		StartAt: base.Add(24 * time.Hour), EndAt: base.Add(25 * time.Hour), IsPublic: true, CreatedBy: user.ID,
	})
	require.NoError(t, err)
	_, err = repo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Private in range", Category: domain.EventCategorySocial,
		StartAt: base.Add(24 * time.Hour), EndAt: base.Add(25 * time.Hour), IsPublic: false, CreatedBy: user.ID,
	})
	require.NoError(t, err)
	_, err = repo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Public out of range", Category: domain.EventCategorySocial,
		StartAt: base.Add(240 * time.Hour), EndAt: base.Add(241 * time.Hour), IsPublic: true, CreatedBy: user.ID,
	})
	require.NoError(t, err)

	from := base
	to := base.Add(48 * time.Hour)
	items, total, err := repo.List(ctx, domain.ListEventsParams{
		CommunityID: communityID, PublicOnly: true, From: &from, To: &to, Page: 1, PerPage: 20,
	})

	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, items, 1)
	assert.Equal(t, inRangePublic.ID, items[0].ID)
}
