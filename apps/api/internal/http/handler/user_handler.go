package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/middleware"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

type UserHandler struct {
	svc                  *service.UserService
	webhookSigningSecret string
}

func NewUserHandler(svc *service.UserService, webhookSigningSecret string) *UserHandler {
	return &UserHandler{svc: svc, webhookSigningSecret: webhookSigningSecret}
}

type userDTO struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FullName  *string   `json:"full_name"`
	AvatarURL *string   `json:"avatar_url"`
	Phone     *string   `json:"phone"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func toUserDTO(u *domain.User) userDTO {
	return userDTO{
		ID:        u.ID.String(),
		Email:     u.Email,
		FullName:  u.FullName,
		AvatarURL: u.AvatarURL,
		Phone:     u.Phone,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

// GetMe handles GET /api/v1/users/me (member).
func (h *UserHandler) GetMe(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)
	user, err := h.svc.GetByID(c.Request.Context(), userID)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toUserDTO(user))
}

type clerkEmailAddress struct {
	ID           string `json:"id"`
	EmailAddress string `json:"email_address"`
}

type clerkPhoneNumber struct {
	PhoneNumber string `json:"phone_number"`
}

type clerkUserData struct {
	ID                    string              `json:"id"`
	FirstName             *string             `json:"first_name"`
	LastName              *string             `json:"last_name"`
	ImageURL              *string             `json:"image_url"`
	PrimaryEmailAddressID string              `json:"primary_email_address_id"`
	EmailAddresses        []clerkEmailAddress `json:"email_addresses"`
	PhoneNumbers          []clerkPhoneNumber  `json:"phone_numbers"`
}

type clerkWebhookPayload struct {
	Type string        `json:"type"`
	Data clerkUserData `json:"data"`
}

// HandleClerkWebhook handles POST /api/v1/webhooks/clerk (public, but
// signature-verified). It upserts the local user row on
// user.created/user.updated — see docs/Schema.md §2.2.
func (h *UserHandler) HandleClerkWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.ErrValidation, "Gagal membaca body request")
		return
	}

	svixID := c.GetHeader("svix-id")
	svixTimestamp := c.GetHeader("svix-timestamp")
	svixSignature := c.GetHeader("svix-signature")
	if svixID == "" || svixTimestamp == "" || svixSignature == "" {
		response.Error(c, http.StatusBadRequest, response.ErrValidation, "Header webhook tidak lengkap")
		return
	}
	if err := verifySvixSignature(h.webhookSigningSecret, svixID, svixTimestamp, svixSignature, body); err != nil {
		response.Error(c, http.StatusUnauthorized, response.ErrUnauthorized, "Signature webhook tidak valid")
		return
	}

	var payload clerkWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		response.Error(c, http.StatusBadRequest, response.ErrValidation, "Payload webhook tidak valid")
		return
	}

	if payload.Type != "user.created" && payload.Type != "user.updated" {
		response.OK(c, http.StatusOK, gin.H{"ignored": payload.Type})
		return
	}

	params := domain.UpsertUserParams{
		ClerkUserID: payload.Data.ID,
		Email:       primaryEmail(payload.Data),
		FullName:    joinName(payload.Data.FirstName, payload.Data.LastName),
		AvatarURL:   payload.Data.ImageURL,
	}
	if len(payload.Data.PhoneNumbers) > 0 {
		params.Phone = &payload.Data.PhoneNumbers[0].PhoneNumber
	}

	user, err := h.svc.SyncFromClerk(c.Request.Context(), params)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toUserDTO(user))
}

func primaryEmail(data clerkUserData) string {
	for _, e := range data.EmailAddresses {
		if e.ID == data.PrimaryEmailAddressID {
			return e.EmailAddress
		}
	}
	if len(data.EmailAddresses) > 0 {
		return data.EmailAddresses[0].EmailAddress
	}
	return ""
}

func joinName(first, last *string) *string {
	parts := []string{}
	if first != nil && *first != "" {
		parts = append(parts, *first)
	}
	if last != nil && *last != "" {
		parts = append(parts, *last)
	}
	if len(parts) == 0 {
		return nil
	}
	name := strings.Join(parts, " ")
	return &name
}
