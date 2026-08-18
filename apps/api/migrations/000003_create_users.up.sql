CREATE TABLE users (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id  text NOT NULL UNIQUE,
    email          text NOT NULL,
    full_name      text,
    avatar_url     text,
    phone          text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);
