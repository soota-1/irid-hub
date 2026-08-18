-- name: CreateTrainingSchedule :one
INSERT INTO training_schedules (community_id, title, day_of_week, start_time, end_time, location, is_active)
VALUES (sqlc.arg(community_id), sqlc.arg(title), sqlc.arg(day_of_week), sqlc.arg(start_time), sqlc.arg(end_time),
        sqlc.arg(location), sqlc.arg(is_active))
RETURNING *;

-- name: GetTrainingScheduleByID :one
SELECT * FROM training_schedules WHERE id = sqlc.arg(id);

-- name: ListActiveTrainingSchedules :many
SELECT * FROM training_schedules
WHERE community_id = sqlc.arg(community_id) AND is_active = true
ORDER BY day_of_week ASC, start_time ASC;

-- name: ListAllTrainingSchedules :many
-- Admin-only: unlike ListActiveTrainingSchedules, includes inactive rows
-- so admins can find and reactivate them — Task.md Phase 2.4.
SELECT * FROM training_schedules
WHERE community_id = sqlc.arg(community_id)
ORDER BY day_of_week ASC, start_time ASC;

-- name: UpdateTrainingSchedule :one
UPDATE training_schedules
SET title = sqlc.arg(title),
    day_of_week = sqlc.arg(day_of_week),
    start_time = sqlc.arg(start_time),
    end_time = sqlc.arg(end_time),
    location = sqlc.arg(location),
    is_active = sqlc.arg(is_active)
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DeleteTrainingSchedule :exec
DELETE FROM training_schedules WHERE id = sqlc.arg(id);
