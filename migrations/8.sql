ALTER TABLE albums ADD COLUMN visibility_days INTEGER;
ALTER TABLE albums ADD COLUMN expires_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_albums_expires_at ON albums(expires_at);
