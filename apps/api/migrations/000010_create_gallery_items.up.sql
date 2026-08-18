CREATE TABLE gallery_items (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id   uuid NOT NULL REFERENCES communities(id),
    type           text NOT NULL CHECK (type IN ('photo', 'video')),
    media_url      text NOT NULL,
    thumbnail_url  text,
    caption        text,
    event_id       uuid REFERENCES events(id),
    uploaded_by    uuid NOT NULL REFERENCES users(id),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_items_community_id ON gallery_items(community_id);
CREATE INDEX idx_gallery_items_event_id ON gallery_items(event_id);
