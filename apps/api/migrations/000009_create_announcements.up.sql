CREATE TABLE announcements (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id  uuid NOT NULL REFERENCES communities(id),
    title         text NOT NULL,
    content       text NOT NULL,
    urgency       text NOT NULL DEFAULT 'info' CHECK (urgency IN ('info', 'warning', 'important')),
    visibility    text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only')),
    published_at  timestamptz,
    created_by    uuid NOT NULL REFERENCES users(id),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_community_id ON announcements(community_id);
CREATE INDEX idx_announcements_community_published_at ON announcements(community_id, published_at);
