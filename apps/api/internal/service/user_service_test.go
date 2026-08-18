package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_UserService_SyncFromClerk_UpsertsUser(t *testing.T) {
	want := &domain.User{ID: uuid.New(), ClerkUserID: "clerk_123", Email: "a@example.com"}
	repo := &mockUserRepo{
		upsertByClerkID: func(ctx context.Context, params domain.UpsertUserParams) (*domain.User, error) {
			return want, nil
		},
	}
	svc := NewUserService(repo)

	got, err := svc.SyncFromClerk(context.Background(), domain.UpsertUserParams{ClerkUserID: "clerk_123", Email: "a@example.com"})

	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func Test_UserService_SyncFromClerk_RejectsMissingClerkUserID(t *testing.T) {
	repo := &mockUserRepo{
		upsertByClerkID: func(ctx context.Context, params domain.UpsertUserParams) (*domain.User, error) {
			t.Fatal("repository should not be called when validation fails")
			return nil, nil
		},
	}
	svc := NewUserService(repo)

	_, err := svc.SyncFromClerk(context.Background(), domain.UpsertUserParams{Email: "a@example.com"})

	require.Error(t, err)
	var validationErr *ValidationErr
	require.ErrorAs(t, err, &validationErr)
}

func Test_UserService_GetByID_ReturnsUser(t *testing.T) {
	want := &domain.User{ID: uuid.New(), Email: "a@example.com"}
	repo := &mockUserRepo{
		getByID: func(ctx context.Context, id uuid.UUID) (*domain.User, error) { return want, nil },
	}
	svc := NewUserService(repo)

	got, err := svc.GetByID(context.Background(), want.ID)

	require.NoError(t, err)
	assert.Equal(t, want, got)
}
