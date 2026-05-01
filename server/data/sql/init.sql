CREATE TABLE IF NOT EXISTS point (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    type TEXT,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

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
