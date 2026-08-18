//go:build integration

package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_Integration_CommunityRepository_GetCurrent(t *testing.T) {
	mustCreateCommunity(t)
	repo := NewCommunityRepository(testQueries)

	got, err := repo.GetCurrent(context.Background())

	require.NoError(t, err)
	assert.NotEqual(t, "", got.Slug)
	assert.False(t, got.CreatedAt.IsZero())
}
