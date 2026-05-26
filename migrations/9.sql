ALTER TABLE bullying_reports ADD COLUMN report_category TEXT DEFAULT 'laporan_bullying';

CREATE INDEX IF NOT EXISTS idx_bullying_category ON bullying_reports(report_category);
