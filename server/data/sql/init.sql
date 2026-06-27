CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name TEXT,
    user_email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name TEXT,
    description TEXT,
    user_uuid UUID NOT NULL REFERENCES users(uuid)
);

CREATE TABLE IF NOT EXISTS point_type (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name TEXT,
    description TEXT,
    project_uuid UUID NOT NULL REFERENCES project(uuid)
);

CREATE TABLE IF NOT EXISTS point (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    point_type_uuid UUID NOT NULL REFERENCES point_type(uuid),
    project_uuid UUID NOT NULL REFERENCES project(uuid),
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS comment (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    point_uuid UUID NOT NULL REFERENCES point(uuid),
    comment_text TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_image (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    comment_uuid UUID NOT NULL REFERENCES comment(uuid),
    filename TEXT NOT NULL,
    content_type TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);