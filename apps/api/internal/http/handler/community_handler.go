package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

type CommunityHandler struct {
	svc *service.CommunityService
}

func NewCommunityHandler(svc *service.CommunityService) *CommunityHandler {
	return &CommunityHandler{svc: svc}
}

type communityDTO struct {
	ID            string    `json:"id"`
	Slug          string    `json:"slug"`
	Name          string    `json:"name"`
	Tagline       *string   `json:"tagline"`
	Description   *string   `json:"description"`
	LogoURL       *string   `json:"logo_url"`
	CoverImageURL *string   `json:"cover_image_url"`
	PrimaryColor  *string   `json:"primary_color"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func toCommunityDTO(c *domain.Community) communityDTO {
	return communityDTO{
		ID:            c.ID.String(),
		Slug:          c.Slug,
		Name:          c.Name,
		Tagline:       c.Tagline,
		Description:   c.Description,
		LogoURL:       c.LogoURL,
		CoverImageURL: c.CoverImageURL,
		PrimaryColor:  c.PrimaryColor,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
	}
}

// GetCurrent handles GET /api/v1/community (public).
func (h *CommunityHandler) GetCurrent(c *gin.Context) {
	community, err := h.svc.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toCommunityDTO(community))
}
