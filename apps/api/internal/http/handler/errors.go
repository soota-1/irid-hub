package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

// handleServiceError maps sentinel errors from the service layer to the
// response envelope's HTTP status + error code (Rules.md §4: handlers
// translate errors, services stay HTTP-agnostic).
func handleServiceError(c *gin.Context, err error) {
	var validationErr *service.ValidationErr
	switch {
	case errors.As(err, &validationErr):
		response.ValidationError(c, validationErr.Fields)
	case errors.Is(err, service.ErrNotFound):
		response.Error(c, http.StatusNotFound, response.ErrNotFound, "Data tidak ditemukan")
	case errors.Is(err, service.ErrConflict):
		response.Error(c, http.StatusConflict, response.ErrConflict, "Terjadi konflik data")
	default:
		response.Error(c, http.StatusInternalServerError, response.ErrInternal, "Terjadi kesalahan pada server")
	}
}
