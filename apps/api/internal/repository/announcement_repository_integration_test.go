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

func Test_Integration_AnnouncementRepository_List_ExcludesDraftsAndMembersOnlyForPublicCallers(t *testing.T) {
	repo := NewAnnouncementRepository(testQueries)
	communityID := mustCreateCommunity(t)
	author := mustCreateUser(t)
	ctx := context.Background()
	now := time.Now().UTC().Truncate(time.Second)

	published, err := repo.Create(ctx, domain.CreateAnnouncementParams{
		CommunityID: communityID, Title: "Published public", Content: "isi",
		Urgency: domain.AnnouncementUrgencyInfo, Visibility: domain.AnnouncementVisibilityPublic,
		PublishedAt: &now, CreatedBy: author.ID,
	})
	require.NoError(t, err)
	_, err = repo.Create(ctx, domain.CreateAnnouncementParams{
		CommunityID: communityID, Title: "Draft", Content: "isi",
		Urgency: domain.AnnouncementUrgencyInfo, Visibility: domain.AnnouncementVisibilityPublic,
		PublishedAt: nil, CreatedBy: author.ID,
	})
	require.NoError(t, err)
	_, err = repo.Create(ctx, domain.CreateAnnouncementParams{
		CommunityID: communityID, Title: "Members only", Content: "isi",
		Urgency: domain.AnnouncementUrgencyInfo, Visibility: domain.AnnouncementVisibilityMembersOnly,
		PublishedAt: &now, CreatedBy: author.ID,
	})
	require.NoError(t, err)

	items, total, err := repo.List(ctx, domain.ListAnnouncementsParams{CommunityID: communityID, IncludeMembers: false, Page: 1, PerPage: 20})

	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, items, 1)
	assert.Equal(t, published.ID, items[0].ID)
}
