CREATE TABLE membership_applications (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id  uuid NOT NULL REFERENCES communities(id),
    full_name     text NOT NULL,
    email         text NOT NULL,
    phone         text NOT NULL,
    motivation    text,
    status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by   uuid REFERENCES users(id),
    reviewed_at   timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_membership_applications_community_id ON membership_applications(community_id);
CREATE INDEX idx_membership_applications_status ON membership_applications(community_id, status);
