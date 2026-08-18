package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

type AdminDashboardHandler struct {
	svc           *service.AdminDashboardService
	communityRepo domain.CommunityRepository
}

func NewAdminDashboardHandler(svc *service.AdminDashboardService, communityRepo domain.CommunityRepository) *AdminDashboardHandler {
	return &AdminDashboardHandler{svc: svc, communityRepo: communityRepo}
}

// GetSummary godoc
// @Summary   Admin dashboard summary
// @Tags      admin
// @Produce   json
// @Security  BearerAuth
// @Success   200  {object}  response.Envelope
// @Failure   403  {object}  response.Envelope
// @Router    /admin/dashboard/summary [get]
func (h *AdminDashboardHandler) GetSummary(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	summary, err := h.svc.GetSummary(c.Request.Context(), community.ID)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, gin.H{
		"active_member_count":  summary.ActiveMemberCount,
		"pending_applications": summary.PendingApplications,
		"upcoming_event_count": summary.UpcomingEventCount,
	})
}
