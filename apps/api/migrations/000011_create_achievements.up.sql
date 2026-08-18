CREATE TABLE achievements (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id       uuid NOT NULL REFERENCES communities(id),
    title              text NOT NULL,
    description        text,
    achieved_at        date NOT NULL,
    icon_or_badge_url  text,
    member_id          uuid REFERENCES memberships(id),
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_achievements_community_id ON achievements(community_id);
CREATE INDEX idx_achievements_member_id ON achievements(member_id);
