-- @tag: 001_add_created_at_to_point
ALTER TABLE point ADD COLUMN IF NOT EXISTS created TIMESTAMP DEFAULT NOW();

-- @tag: 002_add_updated_at_to_point
ALTER TABLE point ADD COLUMN IF NOT EXISTS updated TIMESTAMP DEFAULT NOW();

-- @tag: 003_add_project_uuid_to_point
ALTER TABLE point ADD COLUMN IF NOT EXISTS project_uuid UUID REFERENCES project(uuid);

-- @tag: 004_add_is_public_to_project
ALTER TABLE project ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- @tag: 005_add_name_to_point
ALTER TABLE point ADD COLUMN IF NOT EXISTS name TEXT;
