package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID          uuid.UUID
	ClerkUserID string
	Email       string
	FullName    *string
	AvatarURL   *string
	Phone       *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type UpsertUserParams struct {
	ClerkUserID string
	Email       string
	FullName    *string
	AvatarURL   *string
	Phone       *string
}

type UserRepository interface {
	UpsertByClerkID(ctx context.Context, params UpsertUserParams) (*User, error)
	GetByClerkID(ctx context.Context, clerkUserID string) (*User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
}
