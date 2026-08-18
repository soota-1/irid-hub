CREATE TABLE memberships (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id  uuid NOT NULL REFERENCES communities(id),
    user_id       uuid NOT NULL REFERENCES users(id),
    role          text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'officer', 'admin')),
    status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    joined_at     timestamptz NOT NULL DEFAULT now(),
    bio           text,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    deleted_at    timestamptz,
    UNIQUE (community_id, user_id)
);

CREATE INDEX idx_memberships_community_id ON memberships(community_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
