package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

type MembershipHandler struct {
	svc           *service.MembershipService
	communityRepo domain.CommunityRepository
}

func NewMembershipHandler(svc *service.MembershipService, communityRepo domain.CommunityRepository) *MembershipHandler {
	return &MembershipHandler{svc: svc, communityRepo: communityRepo}
}

type membershipDTO struct {
	ID          string    `json:"id"`
	CommunityID string    `json:"community_id"`
	UserID      string    `json:"user_id"`
	Role        string    `json:"role"`
	Status      string    `json:"status"`
	JoinedAt    time.Time `json:"joined_at"`
	Bio         *string   `json:"bio"`
}

func toMembershipDTO(m domain.Membership) membershipDTO {
	return membershipDTO{
		ID:          m.ID.String(),
		CommunityID: m.CommunityID.String(),
		UserID:      m.UserID.String(),
		Role:        string(m.Role),
		Status:      string(m.Status),
		JoinedAt:    m.JoinedAt,
		Bio:         m.Bio,
	}
}

// List handles GET /api/v1/members (admin).
func (h *MembershipHandler) List(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	page, perPage := parsePagination(c)
	params := domain.ListMembershipsParams{CommunityID: community.ID, Page: page, PerPage: perPage}
	if roleStr := c.Query("role"); roleStr != "" {
		role := domain.MembershipRole(roleStr)
		params.Role = &role
	}
	if statusStr := c.Query("status"); statusStr != "" {
		status := domain.MembershipStatus(statusStr)
		params.Status = &status
	}

	items, total, err := h.svc.List(c.Request.Context(), params)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	dtos := make([]membershipDTO, 0, len(items))
	for _, m := range items {
		dtos = append(dtos, toMembershipDTO(m))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

type updateMembershipRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

// UpdateRole handles PATCH /api/v1/members/:id/role (admin).
func (h *MembershipHandler) UpdateRole(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}

	var req updateMembershipRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"role": "wajib diisi"})
		return
	}

	m, err := h.svc.UpdateRole(c.Request.Context(), id, domain.MembershipRole(req.Role))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toMembershipDTO(*m))
}
