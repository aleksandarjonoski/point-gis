-- @tag: 001_add_created_at_to_point
ALTER TABLE point ADD COLUMN IF NOT EXISTS created TIMESTAMP DEFAULT NOW();

-- @tag: 002_add_updated_at_to_point
ALTER TABLE point ADD COLUMN IF NOT EXISTS updated TIMESTAMP DEFAULT NOW();
