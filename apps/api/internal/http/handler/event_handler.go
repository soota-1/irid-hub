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

type EventHandler struct {
	svc           *service.EventService
	rsvpSvc       *service.EventRsvpService
	communityRepo domain.CommunityRepository
}

func NewEventHandler(svc *service.EventService, rsvpSvc *service.EventRsvpService, communityRepo domain.CommunityRepository) *EventHandler {
	return &EventHandler{svc: svc, rsvpSvc: rsvpSvc, communityRepo: communityRepo}
}

type eventDTO struct {
	ID            string    `json:"id"`
	CommunityID   string    `json:"community_id"`
	Title         string    `json:"title"`
	Description   *string   `json:"description"`
	Category      string    `json:"category"`
	Location      *string   `json:"location"`
	StartAt       time.Time `json:"start_at"`
	EndAt         time.Time `json:"end_at"`
	CoverImageURL *string   `json:"cover_image_url"`
	IsPublic      bool      `json:"is_public"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func toEventDTO(e *domain.Event) eventDTO {
	return eventDTO{
		ID:            e.ID.String(),
		CommunityID:   e.CommunityID.String(),
		Title:         e.Title,
		Description:   e.Description,
		Category:      string(e.Category),
		Location:      e.Location,
		StartAt:       e.StartAt,
		EndAt:         e.EndAt,
		CoverImageURL: e.CoverImageURL,
		IsPublic:      e.IsPublic,
		CreatedBy:     e.CreatedBy.String(),
		CreatedAt:     e.CreatedAt,
		UpdatedAt:     e.UpdatedAt,
	}
}

// List handles GET /api/v1/events (public, paginated, filter rentang tanggal).
func (h *EventHandler) List(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	page, perPage := parsePagination(c)
	params := domain.ListEventsParams{CommunityID: community.ID, Page: page, PerPage: perPage}
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse(time.RFC3339, from); err == nil {
			params.From = &t
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse(time.RFC3339, to); err == nil {
			params.To = &t
		}
	}

	items, total, err := h.svc.ListPublic(c.Request.Context(), params)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	dtos := make([]eventDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toEventDTO(&items[i]))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

// GetByID handles GET /api/v1/events/:id (public).
func (h *EventHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	e, err := h.svc.GetPublicByID(c.Request.Context(), id)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toEventDTO(e))
}

type upsertEventRequest struct {
	Title         string    `json:"title" binding:"required"`
	Description   string    `json:"description"`
	Category      string    `json:"category" binding:"required"`
	Location      string    `json:"location"`
	StartAt       time.Time `json:"start_at" binding:"required"`
	EndAt         time.Time `json:"end_at" binding:"required"`
	CoverImageURL string    `json:"cover_image_url"`
	IsPublic      bool      `json:"is_public"`
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// Create handles POST /api/v1/events (admin).
func (h *EventHandler) Create(c *gin.Context) {
	var req upsertEventRequest
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

	e, err := h.svc.Create(c.Request.Context(), domain.CreateEventParams{
		CommunityID:   community.ID,
		Title:         req.Title,
		Description:   strPtr(req.Description),
		Category:      domain.EventCategory(req.Category),
		Location:      strPtr(req.Location),
		StartAt:       req.StartAt,
		EndAt:         req.EndAt,
		CoverImageURL: strPtr(req.CoverImageURL),
		IsPublic:      req.IsPublic,
		CreatedBy:     userID,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusCreated, toEventDTO(e))
}

// Update handles PATCH /api/v1/events/:id (admin).
func (h *EventHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	var req upsertEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}

	e, err := h.svc.Update(c.Request.Context(), domain.UpdateEventParams{
		ID:            id,
		Title:         req.Title,
		Description:   strPtr(req.Description),
		Category:      domain.EventCategory(req.Category),
		Location:      strPtr(req.Location),
		StartAt:       req.StartAt,
		EndAt:         req.EndAt,
		CoverImageURL: strPtr(req.CoverImageURL),
		IsPublic:      req.IsPublic,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toEventDTO(e))
}

// Delete handles DELETE /api/v1/events/:id (admin, soft delete).
func (h *EventHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	if err := h.svc.SoftDelete(c.Request.Context(), id); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

type rsvpRequest struct {
	Status string `json:"status" binding:"required"`
}

// Rsvp handles POST /api/v1/events/:id/rsvp (member, upsert).
func (h *EventHandler) Rsvp(c *gin.Context) {
	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	var req rsvpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"status": "wajib diisi"})
		return
	}
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	rsvp, err := h.rsvpSvc.Upsert(c.Request.Context(), eventID, userID, domain.EventRsvpStatus(req.Status))
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, gin.H{
		"id":           rsvp.ID.String(),
		"event_id":     rsvp.EventID.String(),
		"user_id":      rsvp.UserID.String(),
		"status":       string(rsvp.Status),
		"responded_at": rsvp.RespondedAt,
	})
}
