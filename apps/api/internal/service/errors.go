package service

import (
	"errors"

	"github.com/jackc/pgx/v5"
)

// Sentinel errors services return so handlers can map them to the right
// HTTP status/error code without services knowing about HTTP (Rules.md §4).
var (
	ErrNotFound   = errors.New("resource not found")
	ErrConflict   = errors.New("conflict")
	ErrValidation = errors.New("validation failed")
)

// ValidationErr carries field-level messages for response.ValidationError.
type ValidationErr struct {
	Fields map[string]string
}

func (e *ValidationErr) Error() string { return "validation failed" }
func (e *ValidationErr) Unwrap() error { return ErrValidation }

// wrapNotFound turns a sqlc "no rows" error into ErrNotFound so handlers
// can map it to a 404 without depending on the repository/pgx layer.
func wrapNotFound(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	return err
}
