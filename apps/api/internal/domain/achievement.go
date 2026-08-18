package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Achievement struct {
	ID             uuid.UUID
	CommunityID    uuid.UUID
	Title          string
	Description    *string
	AchievedAt     time.Time
	IconOrBadgeURL *string
	MemberID       *uuid.UUID
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type CreateAchievementParams struct {
	CommunityID    uuid.UUID
	Title          string
	Description    *string
	AchievedAt     time.Time
	IconOrBadgeURL *string
	MemberID       *uuid.UUID
}

type UpdateAchievementParams struct {
	ID             uuid.UUID
	Title          string
	Description    *string
	AchievedAt     time.Time
	IconOrBadgeURL *string
	MemberID       *uuid.UUID
}

type ListAchievementsParams struct {
	CommunityID uuid.UUID
	Page        int
	PerPage     int
}

type AchievementRepository interface {
	Create(ctx context.Context, params CreateAchievementParams) (*Achievement, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Achievement, error)
	List(ctx context.Context, params ListAchievementsParams) ([]Achievement, int64, error)
	Update(ctx context.Context, params UpdateAchievementParams) (*Achievement, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
