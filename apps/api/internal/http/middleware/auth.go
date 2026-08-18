// Package middleware holds cross-cutting Gin middleware: auth, CORS,
// request logging, and rate limiting.
package middleware

import (
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
)

const (
	ContextKeyUserID      = "userID"
	ContextKeyClerkUserID = "clerkUserID"
)

// Auth verifies the Clerk-issued JWT (via JWKS) on every request, then
// resolves the local user row synced from Clerk's user.created webhook.
// It injects userID into the Gin context for downstream handlers/middleware.
func Auth(userRepo domain.UserRepository, jwks keyfunc.Keyfunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		tokenString, ok := strings.CutPrefix(header, "Bearer ")
		if !ok || tokenString == "" {
			response.Error(c, 401, response.ErrUnauthorized, "Token otorisasi tidak ditemukan")
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, jwks.Keyfunc, jwt.WithValidMethods([]string{"RS256"}))
		if err != nil || !token.Valid {
			response.Error(c, 401, response.ErrUnauthorized, "Token tidak valid atau kedaluwarsa")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.Error(c, 401, response.ErrUnauthorized, "Token tidak valid")
			c.Abort()
			return
		}
		clerkUserID, ok := claims["sub"].(string)
		if !ok || clerkUserID == "" {
			response.Error(c, 401, response.ErrUnauthorized, "Token tidak valid")
			c.Abort()
			return
		}

		user, err := userRepo.GetByClerkID(c.Request.Context(), clerkUserID)
		if err != nil {
			response.Error(c, 401, response.ErrUnauthorized, "User belum tersinkron, coba lagi sesaat lagi")
			c.Abort()
			return
		}

		c.Set(ContextKeyUserID, user.ID)
		c.Set(ContextKeyClerkUserID, clerkUserID)
		c.Next()
	}
}
