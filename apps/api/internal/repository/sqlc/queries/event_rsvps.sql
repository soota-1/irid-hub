-- name: UpsertEventRsvp :one
INSERT INTO event_rsvps (event_id, user_id, status, responded_at)
VALUES (sqlc.arg(event_id), sqlc.arg(user_id), sqlc.arg(status), now())
ON CONFLICT (event_id, user_id) DO UPDATE
SET status = EXCLUDED.status,
    responded_at = now(),
    updated_at = now()
RETURNING *;

-- name: GetEventRsvpByEventAndUser :one
SELECT * FROM event_rsvps WHERE event_id = sqlc.arg(event_id) AND user_id = sqlc.arg(user_id);
