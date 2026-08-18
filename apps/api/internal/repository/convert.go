package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func textToPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func ptrToText(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func uuidToPtr(u pgtype.UUID) *uuid.UUID {
	if !u.Valid {
		return nil
	}
	id := uuid.UUID(u.Bytes)
	return &id
}

func ptrToUUID(id *uuid.UUID) pgtype.UUID {
	if id == nil {
		return pgtype.UUID{}
	}
	return pgtype.UUID{Bytes: *id, Valid: true}
}

func tsToTime(t pgtype.Timestamptz) time.Time {
	if !t.Valid {
		return time.Time{}
	}
	return t.Time
}

func tsToTimePtr(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	tm := t.Time
	return &tm
}

func timeToTs(t time.Time) pgtype.Timestamptz {
	if t.IsZero() {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func timePtrToTs(t *time.Time) pgtype.Timestamptz {
	if t == nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: *t, Valid: true}
}

func dateToTime(d pgtype.Date) time.Time {
	if !d.Valid {
		return time.Time{}
	}
	return d.Time
}

func timeToDate(t time.Time) pgtype.Date {
	return pgtype.Date{Time: t, Valid: true}
}

// timeOfDayLayout matches Postgres' default text representation for `time`.
const timeOfDayLayout = "15:04:05"

func pgTimeToString(t pgtype.Time) string {
	if !t.Valid {
		return ""
	}
	d := time.Duration(t.Microseconds) * time.Microsecond
	return time.Date(0, 1, 1, 0, 0, 0, 0, time.UTC).Add(d).Format(timeOfDayLayout)
}

func stringToPgTime(s string) (pgtype.Time, error) {
	parsed, err := time.Parse(timeOfDayLayout, s)
	if err != nil {
		return pgtype.Time{}, err
	}
	micros := (parsed.Hour()*3600 + parsed.Minute()*60 + parsed.Second()) * 1_000_000
	return pgtype.Time{Microseconds: int64(micros), Valid: true}, nil
}
