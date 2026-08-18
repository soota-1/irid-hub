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

// List godoc
// @Summary   List members
// @Tags      members
// @Produce   json
// @Security  BearerAuth
// @Param     page      query     int     false  "Page number"      default(1)
// @Param     per_page  query     int     false  "Items per page"   default(20)
// @Param     role      query     string  false  "Filter by role"    Enums(member, officer, admin)
// @Param     status    query     string  false  "Filter by status"  Enums(active, inactive, banned)
// @Success   200  {object}  response.Envelope{data=[]membershipDTO}
// @Failure   403  {object}  response.Envelope
// @Router    /members [get]
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

// UpdateRole godoc
// @Summary   Change a member's role
// @Tags      members
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     id    path      string                       true  "Membership ID"
// @Param     body  body      updateMembershipRoleRequest  true  "New role"
// @Success   200  {object}  response.Envelope{data=membershipDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /members/{id}/role [patch]
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
