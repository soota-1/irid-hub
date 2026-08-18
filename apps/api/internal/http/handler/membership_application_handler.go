package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/middleware"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

type MembershipApplicationHandler struct {
	svc           *service.MembershipApplicationService
	communityRepo domain.CommunityRepository
}

func NewMembershipApplicationHandler(svc *service.MembershipApplicationService, communityRepo domain.CommunityRepository) *MembershipApplicationHandler {
	return &MembershipApplicationHandler{svc: svc, communityRepo: communityRepo}
}

type membershipApplicationDTO struct {
	ID          string     `json:"id"`
	CommunityID string     `json:"community_id"`
	FullName    string     `json:"full_name"`
	Email       string     `json:"email"`
	Phone       string     `json:"phone"`
	Motivation  *string    `json:"motivation"`
	Status      string     `json:"status"`
	ReviewedBy  *string    `json:"reviewed_by"`
	ReviewedAt  *time.Time `json:"reviewed_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

func toMembershipApplicationDTO(a *domain.MembershipApplication) membershipApplicationDTO {
	var reviewedBy *string
	if a.ReviewedBy != nil {
		s := a.ReviewedBy.String()
		reviewedBy = &s
	}
	return membershipApplicationDTO{
		ID:          a.ID.String(),
		CommunityID: a.CommunityID.String(),
		FullName:    a.FullName,
		Email:       a.Email,
		Phone:       a.Phone,
		Motivation:  a.Motivation,
		Status:      string(a.Status),
		ReviewedBy:  reviewedBy,
		ReviewedAt:  a.ReviewedAt,
		CreatedAt:   a.CreatedAt,
	}
}

type submitMembershipApplicationRequest struct {
	FullName   string `json:"full_name" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Phone      string `json:"phone" binding:"required"`
	Motivation string `json:"motivation"`
}

// Submit handles POST /api/v1/membership-applications (public, rate-limited).
func (h *MembershipApplicationHandler) Submit(c *gin.Context) {
	var req submitMembershipApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}

	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	var motivation *string
	if req.Motivation != "" {
		motivation = &req.Motivation
	}

	app, err := h.svc.Submit(c.Request.Context(), domain.CreateMembershipApplicationParams{
		CommunityID: community.ID,
		FullName:    req.FullName,
		Email:       req.Email,
		Phone:       req.Phone,
		Motivation:  motivation,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusCreated, toMembershipApplicationDTO(app))
}

// List handles GET /api/v1/membership-applications (admin).
func (h *MembershipApplicationHandler) List(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	page, perPage := parsePagination(c)
	params := domain.ListMembershipApplicationsParams{CommunityID: community.ID, Page: page, PerPage: perPage}
	if statusStr := c.Query("status"); statusStr != "" {
		status := domain.MembershipApplicationStatus(statusStr)
		params.Status = &status
	}

	items, total, err := h.svc.List(c.Request.Context(), params)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	dtos := make([]membershipApplicationDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toMembershipApplicationDTO(&items[i]))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

// Approve handles PATCH /api/v1/membership-applications/:id/approve (admin).
func (h *MembershipApplicationHandler) Approve(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	reviewerID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	app, err := h.svc.Approve(c.Request.Context(), id, reviewerID)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toMembershipApplicationDTO(app))
}

// Reject handles PATCH /api/v1/membership-applications/:id/reject (admin).
func (h *MembershipApplicationHandler) Reject(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	reviewerID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	app, err := h.svc.Reject(c.Request.Context(), id, reviewerID)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toMembershipApplicationDTO(app))
}
