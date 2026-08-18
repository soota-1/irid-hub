//go:build integration

package repository

import (
	"context"
	"testing"

	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_Integration_TrainingScheduleRepository_TimeOfDayRoundTrips(t *testing.T) {
	repo := NewTrainingScheduleRepository(testQueries)
	communityID := mustCreateCommunity(t)
	ctx := context.Background()

	sc, err := repo.Create(ctx, domain.CreateTrainingScheduleParams{
		CommunityID: communityID, Title: "Latihan Rutin Selasa", DayOfWeek: 2,
		StartTime: "18:30:00", EndTime: "20:00:00", IsActive: true,
	})
	require.NoError(t, err)

	assert.Equal(t, "18:30:00", sc.StartTime)
	assert.Equal(t, "20:00:00", sc.EndTime)
}

func Test_Integration_TrainingScheduleRepository_ListActive_ExcludesInactive(t *testing.T) {
	repo := NewTrainingScheduleRepository(testQueries)
	communityID := mustCreateCommunity(t)
	ctx := context.Background()

	active, err := repo.Create(ctx, domain.CreateTrainingScheduleParams{
		CommunityID: communityID, Title: "Active", DayOfWeek: 1, StartTime: "18:00:00", EndTime: "20:00:00", IsActive: true,
	})
	require.NoError(t, err)
	_, err = repo.Create(ctx, domain.CreateTrainingScheduleParams{
		CommunityID: communityID, Title: "Inactive", DayOfWeek: 1, StartTime: "18:00:00", EndTime: "20:00:00", IsActive: false,
	})
	require.NoError(t, err)

	items, err := repo.ListActive(ctx, communityID)

	require.NoError(t, err)
	require.Len(t, items, 1)
	assert.Equal(t, active.ID, items[0].ID)
}
