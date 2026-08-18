package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"golang.org/x/time/rate"
)

// RateLimit throttles public endpoints (e.g. the membership application
// form) per client IP to prevent spam — see docs/Rules.md §6.
func RateLimit(requestsPerMinute int) gin.HandlerFunc {
	limiters := &sync.Map{}
	limit := rate.Every(time.Minute / time.Duration(requestsPerMinute))

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiterAny, _ := limiters.LoadOrStore(ip, rate.NewLimiter(limit, requestsPerMinute))
		limiter := limiterAny.(*rate.Limiter)

		if !limiter.Allow() {
			response.Error(c, 429, response.ErrRateLimited, "Terlalu banyak permintaan, coba lagi nanti")
			c.Abort()
			return
		}
		c.Next()
	}
}
