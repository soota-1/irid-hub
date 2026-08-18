package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Community struct {
	ID            uuid.UUID
	Slug          string
	Name          string
	Tagline       *string
	Description   *string
	LogoURL       *string
	CoverImageURL *string
	PrimaryColor  *string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// CommunityRepository is single-tenant for the MVP: GetCurrent always
// returns the one community row that exists.
type CommunityRepository interface {
	GetCurrent(ctx context.Context) (*Community, error)
}
