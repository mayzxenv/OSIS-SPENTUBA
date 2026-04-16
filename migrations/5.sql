-- Create bullying_reports table
CREATE TABLE IF NOT EXISTS bullying_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_name TEXT NOT NULL,
  incident_description TEXT NOT NULL,
  incident_date TEXT,
  incident_location TEXT,
  status TEXT DEFAULT 'baru',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bullying_status ON bullying_reports(status);
CREATE INDEX IF NOT EXISTS idx_bullying_created ON bullying_reports(created_at DESC);
