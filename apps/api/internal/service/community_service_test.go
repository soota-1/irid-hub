package service

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_CommunityService_GetCurrent_ReturnsCommunity(t *testing.T) {
	want := &domain.Community{ID: uuid.New(), Slug: "iridescent", Name: "Iridescent"}
	repo := &mockCommunityRepo{
		getCurrent: func(ctx context.Context) (*domain.Community, error) { return want, nil },
	}
	svc := NewCommunityService(repo)

	got, err := svc.GetCurrent(context.Background())

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_CommunityService_GetCurrent_RejectsWhenNoCommunityExists(t *testing.T) {
	repo := &mockCommunityRepo{
		getCurrent: func(ctx context.Context) (*domain.Community, error) { return nil, pgx.ErrNoRows },
	}
	svc := NewCommunityService(repo)

	_, err := svc.GetCurrent(context.Background())

	require.Error(t, err)
	assert.True(t, errors.Is(err, ErrNotFound))
}
