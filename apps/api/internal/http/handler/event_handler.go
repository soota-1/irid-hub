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

// List godoc
// @Summary  List public events
// @Tags     events
// @Produce  json
// @Param    page      query     int     false  "Page number"     default(1)
// @Param    per_page  query     int     false  "Items per page"  default(20)
// @Param    from      query     string  false  "Filter start_at >= (RFC3339)"
// @Param    to        query     string  false  "Filter start_at <= (RFC3339)"
// @Success  200  {object}  response.Envelope{data=[]eventDTO}
// @Router   /events [get]
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

// ListAdmin godoc
// @Summary   List all events for admin management (includes private events)
// @Tags      events
// @Produce   json
// @Security  BearerAuth
// @Param     page      query     int     false  "Page number"     default(1)
// @Param     per_page  query     int     false  "Items per page"  default(20)
// @Success   200  {object}  response.Envelope{data=[]eventDTO}
// @Failure   403  {object}  response.Envelope
// @Router    /admin/events [get]
func (h *EventHandler) ListAdmin(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	page, perPage := parsePagination(c)

	items, total, err := h.svc.ListForAdmin(c.Request.Context(), domain.ListEventsParams{CommunityID: community.ID, Page: page, PerPage: perPage})
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

// GetByID godoc
// @Summary      Get a public event
// @Description  Private events are hidden from anonymous callers (returned as 404).
// @Tags         events
// @Produce      json
// @Param        id  path      string  true  "Event ID"
// @Success      200  {object}  response.Envelope{data=eventDTO}
// @Failure      404  {object}  response.Envelope
// @Router       /events/{id} [get]
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

// Create godoc
// @Summary   Create an event
// @Tags      events
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     body  body      upsertEventRequest  true  "Event"
// @Success   201  {object}  response.Envelope{data=eventDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /events [post]
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

// Update godoc
// @Summary   Update an event
// @Tags      events
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     id    path      string               true  "Event ID"
// @Param     body  body      upsertEventRequest   true  "Event"
// @Success   200  {object}  response.Envelope{data=eventDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /events/{id} [patch]
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

// Delete godoc
// @Summary   Delete an event (soft delete)
// @Tags      events
// @Security  BearerAuth
// @Param     id  path  string  true  "Event ID"
// @Success   204  "No Content"
// @Failure   404  {object}  response.Envelope
// @Router    /events/{id} [delete]
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

// Rsvp godoc
// @Summary   RSVP to an event
// @Tags      events
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     id    path      string       true  "Event ID"
// @Param     body  body      rsvpRequest  true  "RSVP status"
// @Success   200  {object}  response.Envelope
// @Failure   401  {object}  response.Envelope
// @Router    /events/{id}/rsvp [post]
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
