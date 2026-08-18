package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type MembershipRole string

const (
	MembershipRoleMember  MembershipRole = "member"
	MembershipRoleOfficer MembershipRole = "officer"
	MembershipRoleAdmin   MembershipRole = "admin"
)

func (r MembershipRole) Valid() bool {
	switch r {
	case MembershipRoleMember, MembershipRoleOfficer, MembershipRoleAdmin:
		return true
	}
	return false
}

// rank returns the relative privilege level of a role, higher = more access.
func (r MembershipRole) rank() int {
	switch r {
	case MembershipRoleAdmin:
		return 3
	case MembershipRoleOfficer:
		return 2
	case MembershipRoleMember:
		return 1
	}
	return 0
}

// AtLeast reports whether this role has at least the privilege of min.
func (r MembershipRole) AtLeast(min MembershipRole) bool {
	return r.rank() >= min.rank()
}

type MembershipStatus string

const (
	MembershipStatusActive   MembershipStatus = "active"
	MembershipStatusInactive MembershipStatus = "inactive"
	MembershipStatusBanned   MembershipStatus = "banned"
)

func (s MembershipStatus) Valid() bool {
	switch s {
	case MembershipStatusActive, MembershipStatusInactive, MembershipStatusBanned:
		return true
	}
	return false
}

type Membership struct {
	ID          uuid.UUID
	CommunityID uuid.UUID
	UserID      uuid.UUID
	Role        MembershipRole
	Status      MembershipStatus
	JoinedAt    time.Time
	Bio         *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type CreateMembershipParams struct {
	CommunityID uuid.UUID
	UserID      uuid.UUID
	Role        MembershipRole
}

type ListMembershipsParams struct {
	CommunityID uuid.UUID
	Role        *MembershipRole
	Status      *MembershipStatus
	Page        int
	PerPage     int
}

type MembershipRepository interface {
	Create(ctx context.Context, params CreateMembershipParams) (*Membership, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Membership, error)
	GetByCommunityAndUser(ctx context.Context, communityID, userID uuid.UUID) (*Membership, error)
	List(ctx context.Context, params ListMembershipsParams) ([]Membership, int64, error)
	UpdateRole(ctx context.Context, id uuid.UUID, role MembershipRole) (*Membership, error)
}
