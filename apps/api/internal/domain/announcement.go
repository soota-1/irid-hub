package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type AnnouncementUrgency string

const (
	AnnouncementUrgencyInfo      AnnouncementUrgency = "info"
	AnnouncementUrgencyWarning   AnnouncementUrgency = "warning"
	AnnouncementUrgencyImportant AnnouncementUrgency = "important"
)

func (u AnnouncementUrgency) Valid() bool {
	switch u {
	case AnnouncementUrgencyInfo, AnnouncementUrgencyWarning, AnnouncementUrgencyImportant:
		return true
	}
	return false
}

type AnnouncementVisibility string

const (
	AnnouncementVisibilityPublic      AnnouncementVisibility = "public"
	AnnouncementVisibilityMembersOnly AnnouncementVisibility = "members_only"
)

func (v AnnouncementVisibility) Valid() bool {
	switch v {
	case AnnouncementVisibilityPublic, AnnouncementVisibilityMembersOnly:
		return true
	}
	return false
}

type Announcement struct {
	ID          uuid.UUID
	CommunityID uuid.UUID
	Title       string
	Content     string
	Urgency     AnnouncementUrgency
	Visibility  AnnouncementVisibility
	PublishedAt *time.Time
	CreatedBy   uuid.UUID
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type CreateAnnouncementParams struct {
	CommunityID uuid.UUID
	Title       string
	Content     string
	Urgency     AnnouncementUrgency
	Visibility  AnnouncementVisibility
	PublishedAt *time.Time
	CreatedBy   uuid.UUID
}

type UpdateAnnouncementParams struct {
	ID          uuid.UUID
	Title       string
	Content     string
	Urgency     AnnouncementUrgency
	Visibility  AnnouncementVisibility
	PublishedAt *time.Time
}

type ListAnnouncementsParams struct {
	CommunityID    uuid.UUID
	IncludeMembers bool // true = include members_only, false = public-only
	Page           int
	PerPage        int
}

type AnnouncementRepository interface {
	Create(ctx context.Context, params CreateAnnouncementParams) (*Announcement, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Announcement, error)
	List(ctx context.Context, params ListAnnouncementsParams) ([]Announcement, int64, error)
	Update(ctx context.Context, params UpdateAnnouncementParams) (*Announcement, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
