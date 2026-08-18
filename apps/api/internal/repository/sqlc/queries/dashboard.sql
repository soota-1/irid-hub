-- name: CountUpcomingEvents :one
SELECT count(*) FROM events
WHERE community_id = sqlc.arg(community_id)
  AND deleted_at IS NULL
  AND start_at >= now();
