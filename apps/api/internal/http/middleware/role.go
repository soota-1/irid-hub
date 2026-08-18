package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
)

const ContextKeyMembership = "membership"

// RequireRole must run after Auth. It resolves the caller's membership in
// the current community (MVP is single-tenant) and rejects the request
// unless the membership is active and at least minRole.
func RequireRole(communityRepo domain.CommunityRepository, membershipRepo domain.MembershipRepository, minRole domain.MembershipRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := c.Get(ContextKeyUserID)
		if !ok {
			response.Error(c, 401, response.ErrUnauthorized, "Token otorisasi tidak ditemukan")
			c.Abort()
			return
		}

		ctx := c.Request.Context()
		community, err := communityRepo.GetCurrent(ctx)
		if err != nil {
			response.Error(c, 500, response.ErrInternal, "Gagal memuat data komunitas")
			c.Abort()
			return
		}

		membership, err := membershipRepo.GetByCommunityAndUser(ctx, community.ID, userID.(uuid.UUID))
		if err != nil {
			response.Error(c, 403, response.ErrForbidden, "Anda bukan member komunitas ini")
			c.Abort()
			return
		}
		if membership.Status != domain.MembershipStatusActive {
			response.Error(c, 403, response.ErrForbidden, "Status keanggotaan Anda tidak aktif")
			c.Abort()
			return
		}
		if !membership.Role.AtLeast(minRole) {
			response.Error(c, 403, response.ErrForbidden, "Anda tidak punya akses untuk aksi ini")
			c.Abort()
			return
		}

		c.Set(ContextKeyMembership, membership)
		c.Next()
	}
}
