-- name: CreateAchievement :one
INSERT INTO achievements (community_id, title, description, achieved_at, icon_or_badge_url, member_id)
VALUES (sqlc.arg(community_id), sqlc.arg(title), sqlc.arg(description), sqlc.arg(achieved_at),
        sqlc.arg(icon_or_badge_url), sqlc.arg(member_id))
RETURNING *;

-- name: GetAchievementByID :one
SELECT * FROM achievements WHERE id = sqlc.arg(id);

-- name: ListAchievements :many
SELECT * FROM achievements
WHERE community_id = sqlc.arg(community_id)
ORDER BY achieved_at DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountAchievements :one
SELECT count(*) FROM achievements WHERE community_id = sqlc.arg(community_id);

-- name: UpdateAchievement :one
UPDATE achievements
SET title = sqlc.arg(title),
    description = sqlc.arg(description),
    achieved_at = sqlc.arg(achieved_at),
    icon_or_badge_url = sqlc.arg(icon_or_badge_url),
    member_id = sqlc.arg(member_id),
    updated_at = now()
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DeleteAchievement :exec
DELETE FROM achievements WHERE id = sqlc.arg(id);
