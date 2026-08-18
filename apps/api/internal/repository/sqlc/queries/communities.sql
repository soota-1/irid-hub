-- name: GetCurrentCommunity :one
SELECT * FROM communities
ORDER BY created_at ASC
LIMIT 1;
