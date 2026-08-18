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

type AnnouncementHandler struct {
	svc           *service.AnnouncementService
	communityRepo domain.CommunityRepository
}

func NewAnnouncementHandler(svc *service.AnnouncementService, communityRepo domain.CommunityRepository) *AnnouncementHandler {
	return &AnnouncementHandler{svc: svc, communityRepo: communityRepo}
}

type announcementDTO struct {
	ID          string     `json:"id"`
	CommunityID string     `json:"community_id"`
	Title       string     `json:"title"`
	Content     string     `json:"content"`
	Urgency     string     `json:"urgency"`
	Visibility  string     `json:"visibility"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedBy   string     `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
}

func toAnnouncementDTO(a *domain.Announcement) announcementDTO {
	return announcementDTO{
		ID:          a.ID.String(),
		CommunityID: a.CommunityID.String(),
		Title:       a.Title,
		Content:     a.Content,
		Urgency:     string(a.Urgency),
		Visibility:  string(a.Visibility),
		PublishedAt: a.PublishedAt,
		CreatedBy:   a.CreatedBy.String(),
		CreatedAt:   a.CreatedAt,
	}
}

func (h *AnnouncementHandler) listCommon(c *gin.Context, includeMembers bool) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	page, perPage := parsePagination(c)

	var items []domain.Announcement
	var total int64
	if includeMembers {
		items, total, err = h.svc.ListInternal(c.Request.Context(), community.ID, page, perPage)
	} else {
		items, total, err = h.svc.ListPublic(c.Request.Context(), community.ID, page, perPage)
	}
	if err != nil {
		handleServiceError(c, err)
		return
	}

	dtos := make([]announcementDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toAnnouncementDTO(&items[i]))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

// ListPublic godoc
// @Summary  List public announcements
// @Tags     announcements
// @Produce  json
// @Param    page      query     int  false  "Page number"     default(1)
// @Param    per_page  query     int  false  "Items per page"  default(20)
// @Success  200  {object}  response.Envelope{data=[]announcementDTO}
// @Router   /announcements [get]
func (h *AnnouncementHandler) ListPublic(c *gin.Context) { h.listCommon(c, false) }

// ListInternal godoc
// @Summary   List announcements including members-only ones
// @Tags      announcements
// @Produce   json
// @Security  BearerAuth
// @Param     page      query     int  false  "Page number"     default(1)
// @Param     per_page  query     int  false  "Items per page"  default(20)
// @Success   200  {object}  response.Envelope{data=[]announcementDTO}
// @Failure   403  {object}  response.Envelope
// @Router    /announcements/internal [get]
func (h *AnnouncementHandler) ListInternal(c *gin.Context) { h.listCommon(c, true) }

// ListAdmin godoc
// @Summary   List all announcements for admin management (includes drafts)
// @Tags      announcements
// @Produce   json
// @Security  BearerAuth
// @Param     page      query     int  false  "Page number"     default(1)
// @Param     per_page  query     int  false  "Items per page"  default(20)
// @Success   200  {object}  response.Envelope{data=[]announcementDTO}
// @Failure   403  {object}  response.Envelope
// @Router    /admin/announcements [get]
func (h *AnnouncementHandler) ListAdmin(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	page, perPage := parsePagination(c)

	items, total, err := h.svc.ListForAdmin(c.Request.Context(), community.ID, page, perPage)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	dtos := make([]announcementDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toAnnouncementDTO(&items[i]))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

type upsertAnnouncementRequest struct {
	Title       string     `json:"title" binding:"required"`
	Content     string     `json:"content" binding:"required"`
	Urgency     string     `json:"urgency" binding:"required"`
	Visibility  string     `json:"visibility" binding:"required"`
	PublishedAt *time.Time `json:"published_at"`
}

// Create godoc
// @Summary      Create an announcement
// @Description  Omit published_at (or send null) to save as a draft.
// @Tags         announcements
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      upsertAnnouncementRequest  true  "Announcement"
// @Success      201  {object}  response.Envelope{data=announcementDTO}
// @Failure      422  {object}  response.Envelope
// @Router       /announcements [post]
func (h *AnnouncementHandler) Create(c *gin.Context) {
	var req upsertAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	a, err := h.svc.Create(c.Request.Context(), domain.CreateAnnouncementParams{
		CommunityID: community.ID,
		Title:       req.Title,
		Content:     req.Content,
		Urgency:     domain.AnnouncementUrgency(req.Urgency),
		Visibility:  domain.AnnouncementVisibility(req.Visibility),
		PublishedAt: req.PublishedAt,
		CreatedBy:   userID,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusCreated, toAnnouncementDTO(a))
}

// Update godoc
// @Summary   Update an announcement
// @Tags      announcements
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     id    path      string                      true  "Announcement ID"
// @Param     body  body      upsertAnnouncementRequest  true  "Announcement"
// @Success   200  {object}  response.Envelope{data=announcementDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /announcements/{id} [patch]
func (h *AnnouncementHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	var req upsertAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}

	a, err := h.svc.Update(c.Request.Context(), domain.UpdateAnnouncementParams{
		ID:          id,
		Title:       req.Title,
		Content:     req.Content,
		Urgency:     domain.AnnouncementUrgency(req.Urgency),
		Visibility:  domain.AnnouncementVisibility(req.Visibility),
		PublishedAt: req.PublishedAt,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toAnnouncementDTO(a))
}

// Delete godoc
// @Summary   Delete an announcement
// @Tags      announcements
// @Security  BearerAuth
// @Param     id  path  string  true  "Announcement ID"
// @Success   204  "No Content"
// @Failure   404  {object}  response.Envelope
// @Router    /announcements/{id} [delete]
func (h *AnnouncementHandler) Delete(c *gin.Context) {
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
