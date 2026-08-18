// Package response implements the API response envelope from
// docs/Schema.md §4 so every endpoint returns the same shape.
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorCode string

const (
	ErrValidation   ErrorCode = "VALIDATION_ERROR"
	ErrUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrForbidden    ErrorCode = "FORBIDDEN"
	ErrNotFound     ErrorCode = "NOT_FOUND"
	ErrConflict     ErrorCode = "CONFLICT"
	ErrRateLimited  ErrorCode = "RATE_LIMITED"
	ErrInternal     ErrorCode = "INTERNAL_ERROR"
)

type Meta struct {
	Page    int   `json:"page"`
	PerPage int   `json:"per_page"`
	Total   int64 `json:"total"`
}

// ErrorBody is exported (rather than the historical unexported name) only
// so swag can generate a model for it — no change in JSON shape.
type ErrorBody struct {
	Code    ErrorCode         `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

// Envelope is the response shape from docs/Schema.md §4.
type Envelope struct {
	Success bool       `json:"success"`
	Data    any        `json:"data"`
	Meta    *Meta      `json:"meta"`
	Error   *ErrorBody `json:"error"`
}

func OK(c *gin.Context, status int, data any) {
	c.JSON(status, Envelope{Success: true, Data: data})
}

func OKPaginated(c *gin.Context, data any, meta Meta) {
	c.JSON(http.StatusOK, Envelope{Success: true, Data: data, Meta: &meta})
}

func Error(c *gin.Context, status int, code ErrorCode, message string) {
	c.JSON(status, Envelope{Success: false, Error: &ErrorBody{Code: code, Message: message}})
}

func ValidationError(c *gin.Context, fields map[string]string) {
	c.JSON(http.StatusUnprocessableEntity, Envelope{
		Success: false,
		Error: &ErrorBody{
			Code:    ErrValidation,
			Message: "Satu atau lebih field tidak valid",
			Fields:  fields,
		},
	})
}
