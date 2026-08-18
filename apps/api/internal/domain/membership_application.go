package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type MembershipApplicationStatus string

const (
	MembershipApplicationPending  MembershipApplicationStatus = "pending"
	MembershipApplicationApproved MembershipApplicationStatus = "approved"
	MembershipApplicationRejected MembershipApplicationStatus = "rejected"
)

type MembershipApplication struct {
	ID          uuid.UUID
	CommunityID uuid.UUID
	FullName    string
	Email       string
	Phone       string
	Motivation  *string
	Status      MembershipApplicationStatus
	ReviewedBy  *uuid.UUID
	ReviewedAt  *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type CreateMembershipApplicationParams struct {
	CommunityID uuid.UUID
	FullName    string
	Email       string
	Phone       string
	Motivation  *string
}

type ListMembershipApplicationsParams struct {
	CommunityID uuid.UUID
	Status      *MembershipApplicationStatus
	Page        int
	PerPage     int
}

type MembershipApplicationRepository interface {
	Create(ctx context.Context, params CreateMembershipApplicationParams) (*MembershipApplication, error)
	GetByID(ctx context.Context, id uuid.UUID) (*MembershipApplication, error)
	List(ctx context.Context, params ListMembershipApplicationsParams) ([]MembershipApplication, int64, error)
	HasPendingByEmail(ctx context.Context, communityID uuid.UUID, email string) (bool, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status MembershipApplicationStatus, reviewedBy uuid.UUID) (*MembershipApplication, error)
}
