
CREATE TABLE appreciations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id TEXT NOT NULL,
  from_user_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appreciations_created_at ON appreciations(created_at DESC);
CREATE INDEX idx_appreciations_from_user_id ON appreciations(from_user_id);
