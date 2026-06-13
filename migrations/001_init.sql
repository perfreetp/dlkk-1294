CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  education TEXT,
  major TEXT,
  graduation_year INTEGER,
  total_work_years INTEGER DEFAULT 0,
  industry TEXT,
  skills_json TEXT,
  experiences_json TEXT,
  current_salary TEXT,
  expected_salary TEXT,
  status TEXT DEFAULT 'pending',
  consultant_notes TEXT,
  recommendation_reason TEXT,
  resume_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  industry TEXT,
  salary_range TEXT,
  location TEXT,
  min_work_years INTEGER DEFAULT 0,
  education_requirement TEXT,
  description TEXT,
  responsibilities_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_requirements (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  skill TEXT NOT NULL,
  required BOOLEAN DEFAULT 1,
  weight INTEGER DEFAULT 10,
  min_years INTEGER,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS match_reports (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  dimensions_json TEXT,
  missing_items_json TEXT,
  interview_questions_json TEXT,
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communications (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT DEFAULT 'system',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT,
  content TEXT NOT NULL,
  variables_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS export_logs (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  template_id TEXT,
  format TEXT DEFAULT 'pdf',
  file_path TEXT,
  exported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_industry ON candidates(industry);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(name);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_match_reports_candidate ON match_reports(candidate_id);
CREATE INDEX IF NOT EXISTS idx_match_reports_job ON match_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_communications_candidate ON communications(candidate_id);
