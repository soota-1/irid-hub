CREATE TABLE events (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id      uuid NOT NULL REFERENCES communities(id),
    title             text NOT NULL,
    description       text,
    category          text NOT NULL DEFAULT 'other' CHECK (category IN ('training', 'competition', 'social', 'other')),
    location          text,
    start_at          timestamptz NOT NULL,
    end_at            timestamptz NOT NULL,
    cover_image_url   text,
    is_public         boolean NOT NULL DEFAULT true,
    created_by        uuid NOT NULL REFERENCES users(id),
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    deleted_at        timestamptz
);

CREATE INDEX idx_events_community_id ON events(community_id);
CREATE INDEX idx_events_community_start_at ON events(community_id, start_at);
