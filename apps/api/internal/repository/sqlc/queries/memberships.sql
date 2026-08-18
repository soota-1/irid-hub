-- name: CreateMembership :one
INSERT INTO memberships (community_id, user_id, role)
VALUES (sqlc.arg(community_id), sqlc.arg(user_id), sqlc.arg(role))
RETURNING *;

-- name: GetMembershipByID :one
SELECT * FROM memberships WHERE id = sqlc.arg(id) AND deleted_at IS NULL;

-- name: GetMembershipByCommunityAndUser :one
SELECT * FROM memberships
WHERE community_id = sqlc.arg(community_id) AND user_id = sqlc.arg(user_id) AND deleted_at IS NULL;

-- name: ListMemberships :many
SELECT * FROM memberships
WHERE community_id = sqlc.arg(community_id)
  AND deleted_at IS NULL
  AND (sqlc.narg(role)::text IS NULL OR role = sqlc.narg(role))
  AND (sqlc.narg(status)::text IS NULL OR status = sqlc.narg(status))
ORDER BY joined_at DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountMemberships :one
SELECT count(*) FROM memberships
WHERE community_id = sqlc.arg(community_id)
  AND deleted_at IS NULL
  AND (sqlc.narg(role)::text IS NULL OR role = sqlc.narg(role))
  AND (sqlc.narg(status)::text IS NULL OR status = sqlc.narg(status));

-- name: UpdateMembershipRole :one
UPDATE memberships
SET role = sqlc.arg(role), updated_at = now()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING *;
