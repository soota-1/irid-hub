-- name: CreateAnnouncement :one
INSERT INTO announcements (community_id, title, content, urgency, visibility, published_at, created_by)
VALUES (sqlc.arg(community_id), sqlc.arg(title), sqlc.arg(content), sqlc.arg(urgency), sqlc.arg(visibility),
        sqlc.arg(published_at), sqlc.arg(created_by))
RETURNING *;

-- name: GetAnnouncementByID :one
SELECT * FROM announcements WHERE id = sqlc.arg(id);

-- name: ListAnnouncements :many
SELECT * FROM announcements
WHERE community_id = sqlc.arg(community_id)
  AND published_at IS NOT NULL
  AND (sqlc.arg(include_members)::bool OR visibility = 'public')
ORDER BY published_at DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountAnnouncements :one
SELECT count(*) FROM announcements
WHERE community_id = sqlc.arg(community_id)
  AND published_at IS NOT NULL
  AND (sqlc.arg(include_members)::bool OR visibility = 'public');

-- name: UpdateAnnouncement :one
UPDATE announcements
SET title = sqlc.arg(title),
    content = sqlc.arg(content),
    urgency = sqlc.arg(urgency),
    visibility = sqlc.arg(visibility),
    published_at = sqlc.arg(published_at),
    updated_at = now()
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DeleteAnnouncement :exec
DELETE FROM announcements WHERE id = sqlc.arg(id);
