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

type errorBody struct {
	Code    ErrorCode         `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

type envelope struct {
	Success bool       `json:"success"`
	Data    any        `json:"data"`
	Meta    *Meta      `json:"meta"`
	Error   *errorBody `json:"error"`
}

func OK(c *gin.Context, status int, data any) {
	c.JSON(status, envelope{Success: true, Data: data})
}

func OKPaginated(c *gin.Context, data any, meta Meta) {
	c.JSON(http.StatusOK, envelope{Success: true, Data: data, Meta: &meta})
}

func Error(c *gin.Context, status int, code ErrorCode, message string) {
	c.JSON(status, envelope{Success: false, Error: &errorBody{Code: code, Message: message}})
}

func ValidationError(c *gin.Context, fields map[string]string) {
	c.JSON(http.StatusUnprocessableEntity, envelope{
		Success: false,
		Error: &errorBody{
			Code:    ErrValidation,
			Message: "Satu atau lebih field tidak valid",
			Fields:  fields,
		},
	})
}
