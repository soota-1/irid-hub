CREATE TABLE training_schedules (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id  uuid NOT NULL REFERENCES communities(id),
    title         text NOT NULL,
    day_of_week   int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time    time NOT NULL,
    end_time      time NOT NULL,
    location      text,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_schedules_community_id ON training_schedules(community_id);
