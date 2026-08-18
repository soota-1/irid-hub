-- name: CreateMembershipApplication :one
INSERT INTO membership_applications (community_id, full_name, email, phone, motivation)
VALUES (sqlc.arg(community_id), sqlc.arg(full_name), sqlc.arg(email), sqlc.arg(phone), sqlc.arg(motivation))
RETURNING *;

-- name: GetMembershipApplicationByID :one
SELECT * FROM membership_applications WHERE id = sqlc.arg(id);

-- name: ListMembershipApplications :many
SELECT * FROM membership_applications
WHERE community_id = sqlc.arg(community_id)
  AND (sqlc.narg(status)::text IS NULL OR status = sqlc.narg(status))
ORDER BY created_at DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountMembershipApplications :one
SELECT count(*) FROM membership_applications
WHERE community_id = sqlc.arg(community_id)
  AND (sqlc.narg(status)::text IS NULL OR status = sqlc.narg(status));

-- name: HasPendingMembershipApplicationByEmail :one
SELECT EXISTS (
    SELECT 1 FROM membership_applications
    WHERE community_id = sqlc.arg(community_id)
      AND email = sqlc.arg(email)
      AND status = 'pending'
) AS exists;

-- name: UpdateMembershipApplicationStatus :one
UPDATE membership_applications
SET status = sqlc.arg(status),
    reviewed_by = sqlc.arg(reviewed_by),
    reviewed_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
RETURNING *;
