-- name: CreateGalleryItem :one
INSERT INTO gallery_items (community_id, type, media_url, thumbnail_url, caption, event_id, uploaded_by)
VALUES (sqlc.arg(community_id), sqlc.arg(type), sqlc.arg(media_url), sqlc.arg(thumbnail_url), sqlc.arg(caption),
        sqlc.arg(event_id), sqlc.arg(uploaded_by))
RETURNING *;

-- name: GetGalleryItemByID :one
SELECT * FROM gallery_items WHERE id = sqlc.arg(id);

-- name: ListGalleryItems :many
SELECT * FROM gallery_items
WHERE community_id = sqlc.arg(community_id)
  AND (sqlc.narg(event_id)::uuid IS NULL OR event_id = sqlc.narg(event_id))
ORDER BY created_at DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountGalleryItems :one
SELECT count(*) FROM gallery_items
WHERE community_id = sqlc.arg(community_id)
  AND (sqlc.narg(event_id)::uuid IS NULL OR event_id = sqlc.narg(event_id));

-- name: DeleteGalleryItem :exec
DELETE FROM gallery_items WHERE id = sqlc.arg(id);
