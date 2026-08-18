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

func Test_Integration_DashboardRepository_CountUpcomingEvents_ExcludesPastEvents(t *testing.T) {
	dashboardRepo := NewDashboardRepository(testQueries)
	eventRepo := NewEventRepository(testQueries)
	communityID := mustCreateCommunity(t)
	user := mustCreateUser(t)
	ctx := context.Background()
	now := time.Now().UTC()

	_, err := eventRepo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Upcoming", Category: domain.EventCategorySocial,
		StartAt: now.Add(48 * time.Hour), EndAt: now.Add(49 * time.Hour), IsPublic: true, CreatedBy: user.ID,
	})
	require.NoError(t, err)
	_, err = eventRepo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Past", Category: domain.EventCategorySocial,
		StartAt: now.Add(-48 * time.Hour), EndAt: now.Add(-47 * time.Hour), IsPublic: true, CreatedBy: user.ID,
	})
	require.NoError(t, err)

	count, err := dashboardRepo.CountUpcomingEvents(ctx, communityID)

	require.NoError(t, err)
	assert.Equal(t, int64(1), count)
}
