package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/soota-1/irid-hub/apps/api/internal/db"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
)

type HealthHandler struct {
	pool *pgxpool.Pool
}

func NewHealthHandler(pool *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{pool: pool}
}

func (h *HealthHandler) Check(c *gin.Context) {
	if err := db.HealthCheck(c.Request.Context(), h.pool); err != nil {
		response.Error(c, http.StatusServiceUnavailable, response.ErrInternal, "Database tidak terhubung")
		return
	}
	response.OK(c, http.StatusOK, gin.H{"status": "ok"})
}
