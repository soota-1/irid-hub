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

func Test_Integration_EventRsvpRepository_Upsert_UpdatesExistingRsvp(t *testing.T) {
	eventRepo := NewEventRepository(testQueries)
	rsvpRepo := NewEventRsvpRepository(testQueries)
	communityID := mustCreateCommunity(t)
	organizer := mustCreateUser(t)
	attendee := mustCreateUser(t)
	ctx := context.Background()
	now := time.Now().UTC().Truncate(time.Second)

	e, err := eventRepo.Create(ctx, domain.CreateEventParams{
		CommunityID: communityID, Title: "Latihan", Category: domain.EventCategoryTraining,
		StartAt: now, EndAt: now.Add(time.Hour), IsPublic: true, CreatedBy: organizer.ID,
	})
	require.NoError(t, err)

	first, err := rsvpRepo.Upsert(ctx, e.ID, attendee.ID, domain.EventRsvpMaybe)
	require.NoError(t, err)
	assert.Equal(t, domain.EventRsvpMaybe, first.Status)

	second, err := rsvpRepo.Upsert(ctx, e.ID, attendee.ID, domain.EventRsvpGoing)
	require.NoError(t, err)

	assert.Equal(t, first.ID, second.ID, "the UNIQUE(event_id, user_id) constraint must make this an update, not a new row")
	assert.Equal(t, domain.EventRsvpGoing, second.Status)
}
