package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

const ContextKeyRequestID = "requestID"

// Logging assigns a request ID and emits one structured log line per
// request (method, path, status, latency, request ID) — see
// docs/Architecture.md §4.
func Logging(logger zerolog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.NewString()
		}
		c.Set(ContextKeyRequestID, requestID)
		c.Header("X-Request-ID", requestID)

		start := time.Now()
		c.Next()
		latency := time.Since(start)

		logger.Info().
			Str("request_id", requestID).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", c.Writer.Status()).
			Dur("latency", latency).
			Msg("request handled")
	}
}
