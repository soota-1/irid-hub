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

type AchievementHandler struct {
	svc           *service.AchievementService
	communityRepo domain.CommunityRepository
}

func NewAchievementHandler(svc *service.AchievementService, communityRepo domain.CommunityRepository) *AchievementHandler {
	return &AchievementHandler{svc: svc, communityRepo: communityRepo}
}

type achievementDTO struct {
	ID             string    `json:"id"`
	CommunityID    string    `json:"community_id"`
	Title          string    `json:"title"`
	Description    *string   `json:"description"`
	AchievedAt     time.Time `json:"achieved_at"`
	IconOrBadgeURL *string   `json:"icon_or_badge_url"`
	MemberID       *string   `json:"member_id"`
}

func toAchievementDTO(a *domain.Achievement) achievementDTO {
	var memberID *string
	if a.MemberID != nil {
		s := a.MemberID.String()
		memberID = &s
	}
	return achievementDTO{
		ID:             a.ID.String(),
		CommunityID:    a.CommunityID.String(),
		Title:          a.Title,
		Description:    a.Description,
		AchievedAt:     a.AchievedAt,
		IconOrBadgeURL: a.IconOrBadgeURL,
		MemberID:       memberID,
	}
}

// List godoc
// @Summary  List achievements
// @Tags     achievements
// @Produce  json
// @Param    page      query     int  false  "Page number"     default(1)
// @Param    per_page  query     int  false  "Items per page"  default(20)
// @Success  200  {object}  response.Envelope{data=[]achievementDTO}
// @Router   /achievements [get]
func (h *AchievementHandler) List(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	page, perPage := parsePagination(c)
	items, total, err := h.svc.List(c.Request.Context(), domain.ListAchievementsParams{
		CommunityID: community.ID, Page: page, PerPage: perPage,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	dtos := make([]achievementDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toAchievementDTO(&items[i]))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

type upsertAchievementRequest struct {
	Title          string    `json:"title" binding:"required"`
	Description    string    `json:"description"`
	AchievedAt     time.Time `json:"achieved_at" binding:"required"`
	IconOrBadgeURL string    `json:"icon_or_badge_url"`
	MemberID       string    `json:"member_id"`
}

// Create godoc
// @Summary   Create an achievement
// @Tags      achievements
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     body  body      upsertAchievementRequest  true  "Achievement"
// @Success   201  {object}  response.Envelope{data=achievementDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /achievements [post]
func (h *AchievementHandler) Create(c *gin.Context) {
	var req upsertAchievementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	a, err := h.svc.Create(c.Request.Context(), domain.CreateAchievementParams{
		CommunityID:    community.ID,
		Title:          req.Title,
		Description:    strPtr(req.Description),
		AchievedAt:     req.AchievedAt,
		IconOrBadgeURL: strPtr(req.IconOrBadgeURL),
		MemberID:       parseUUIDPtr(req.MemberID),
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusCreated, toAchievementDTO(a))
}

// Update godoc
// @Summary   Update an achievement
// @Tags      achievements
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     id    path      string                     true  "Achievement ID"
// @Param     body  body      upsertAchievementRequest  true  "Achievement"
// @Success   200  {object}  response.Envelope{data=achievementDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /achievements/{id} [patch]
func (h *AchievementHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	var req upsertAchievementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}

	a, err := h.svc.Update(c.Request.Context(), domain.UpdateAchievementParams{
		ID:             id,
		Title:          req.Title,
		Description:    strPtr(req.Description),
		AchievedAt:     req.AchievedAt,
		IconOrBadgeURL: strPtr(req.IconOrBadgeURL),
		MemberID:       parseUUIDPtr(req.MemberID),
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toAchievementDTO(a))
}

// Delete godoc
// @Summary   Delete an achievement
// @Tags      achievements
// @Security  BearerAuth
// @Param     id  path  string  true  "Achievement ID"
// @Success   204  "No Content"
// @Failure   404  {object}  response.Envelope
// @Router    /achievements/{id} [delete]
func (h *AchievementHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func parseUUIDPtr(s string) *uuid.UUID {
	if s == "" {
		return nil
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return nil
	}
	return &id
}
