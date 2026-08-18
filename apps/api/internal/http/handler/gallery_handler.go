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

type GalleryHandler struct {
	svc           *service.GalleryService
	communityRepo domain.CommunityRepository
}

func NewGalleryHandler(svc *service.GalleryService, communityRepo domain.CommunityRepository) *GalleryHandler {
	return &GalleryHandler{svc: svc, communityRepo: communityRepo}
}

type galleryItemDTO struct {
	ID           string    `json:"id"`
	CommunityID  string    `json:"community_id"`
	Type         string    `json:"type"`
	MediaURL     string    `json:"media_url"`
	ThumbnailURL *string   `json:"thumbnail_url"`
	Caption      *string   `json:"caption"`
	EventID      *string   `json:"event_id"`
	UploadedBy   string    `json:"uploaded_by"`
	CreatedAt    time.Time `json:"created_at"`
}

func toGalleryItemDTO(g *domain.GalleryItem) galleryItemDTO {
	var eventID *string
	if g.EventID != nil {
		s := g.EventID.String()
		eventID = &s
	}
	return galleryItemDTO{
		ID:           g.ID.String(),
		CommunityID:  g.CommunityID.String(),
		Type:         string(g.Type),
		MediaURL:     g.MediaURL,
		ThumbnailURL: g.ThumbnailURL,
		Caption:      g.Caption,
		EventID:      eventID,
		UploadedBy:   g.UploadedBy.String(),
		CreatedAt:    g.CreatedAt,
	}
}

// List handles GET /api/v1/gallery (public, paginated, filter by event_id).
func (h *GalleryHandler) List(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	page, perPage := parsePagination(c)
	params := domain.ListGalleryItemsParams{CommunityID: community.ID, Page: page, PerPage: perPage}
	if eventIDStr := c.Query("event_id"); eventIDStr != "" {
		if eventID, err := uuid.Parse(eventIDStr); err == nil {
			params.EventID = &eventID
		}
	}

	items, total, err := h.svc.List(c.Request.Context(), params)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	dtos := make([]galleryItemDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toGalleryItemDTO(&items[i]))
	}
	response.OKPaginated(c, dtos, response.Meta{Page: page, PerPage: perPage, Total: total})
}

type presignUploadRequest struct {
	ContentType string `json:"content_type" binding:"required"`
	SizeBytes   int64  `json:"size_bytes" binding:"required"`
}

// PresignUpload handles POST /api/v1/gallery/presigned-url (admin).
func (h *GalleryHandler) PresignUpload(c *gin.Context) {
	var req presignUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	result, err := h.svc.PresignUpload(c.Request.Context(), community.ID, req.ContentType, req.SizeBytes)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, gin.H{"upload_url": result.UploadURL, "object_key": result.ObjectKey})
}

type createGalleryItemRequest struct {
	Type         string `json:"type" binding:"required"`
	MediaURL     string `json:"media_url" binding:"required"`
	ThumbnailURL string `json:"thumbnail_url"`
	Caption      string `json:"caption"`
	EventID      string `json:"event_id"`
}

// Create handles POST /api/v1/gallery (admin, save metadata after upload).
func (h *GalleryHandler) Create(c *gin.Context) {
	var req createGalleryItemRequest
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

	var eventID *uuid.UUID
	if req.EventID != "" {
		if parsed, err := uuid.Parse(req.EventID); err == nil {
			eventID = &parsed
		}
	}

	item, err := h.svc.Create(c.Request.Context(), domain.CreateGalleryItemParams{
		CommunityID:  community.ID,
		Type:         domain.GalleryItemType(req.Type),
		MediaURL:     req.MediaURL,
		ThumbnailURL: strPtr(req.ThumbnailURL),
		Caption:      strPtr(req.Caption),
		EventID:      eventID,
		UploadedBy:   userID,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusCreated, toGalleryItemDTO(item))
}

// Delete handles DELETE /api/v1/gallery/:id (admin).
func (h *GalleryHandler) Delete(c *gin.Context) {
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
