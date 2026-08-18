-- name: CreateEvent :one
INSERT INTO events (community_id, title, description, category, location, start_at, end_at, cover_image_url, is_public, created_by)
VALUES (sqlc.arg(community_id), sqlc.arg(title), sqlc.arg(description), sqlc.arg(category), sqlc.arg(location),
        sqlc.arg(start_at), sqlc.arg(end_at), sqlc.arg(cover_image_url), sqlc.arg(is_public), sqlc.arg(created_by))
RETURNING *;

-- name: GetEventByID :one
SELECT * FROM events WHERE id = sqlc.arg(id) AND deleted_at IS NULL;

-- name: ListEvents :many
SELECT * FROM events
WHERE community_id = sqlc.arg(community_id)
  AND deleted_at IS NULL
  AND (NOT sqlc.arg(public_only)::bool OR is_public = true)
  AND (sqlc.narg(from_date)::timestamptz IS NULL OR start_at >= sqlc.narg(from_date))
  AND (sqlc.narg(to_date)::timestamptz IS NULL OR start_at <= sqlc.narg(to_date))
ORDER BY start_at ASC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountEvents :one
SELECT count(*) FROM events
WHERE community_id = sqlc.arg(community_id)
  AND deleted_at IS NULL
  AND (NOT sqlc.arg(public_only)::bool OR is_public = true)
  AND (sqlc.narg(from_date)::timestamptz IS NULL OR start_at >= sqlc.narg(from_date))
  AND (sqlc.narg(to_date)::timestamptz IS NULL OR start_at <= sqlc.narg(to_date));

-- name: UpdateEvent :one
UPDATE events
SET title = sqlc.arg(title),
    description = sqlc.arg(description),
    category = sqlc.arg(category),
    location = sqlc.arg(location),
    start_at = sqlc.arg(start_at),
    end_at = sqlc.arg(end_at),
    cover_image_url = sqlc.arg(cover_image_url),
    is_public = sqlc.arg(is_public),
    updated_at = now()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteEvent :exec
UPDATE events SET deleted_at = now(), updated_at = now()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL;
