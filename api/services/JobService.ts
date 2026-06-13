import { db, generateId } from '../db';
import type { Job, JobRequirement } from '../../shared/types';

export function getJobs(filters?: {
  industry?: string;
  search?: string;
}): Job[] {
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.industry) {
    sql += ' AND industry = ?';
    params.push(filters.industry);
  }
  
  if (filters?.search) {
    sql += ' AND (title LIKE ? OR department LIKE ? OR description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const rows = db.prepare(sql).all(...params) as any[];
  
  return rows.map(row => mapJobRow(row));
}

function mapJobRow(row: any): Job & { requirements: JobRequirement[] } {
  const requirements = db.prepare('SELECT skill, required, weight, min_years as minYears FROM job_requirements WHERE job_id = ?').all(row.id) as JobRequirement[];
  
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    industry: row.industry,
    salaryRange: row.salary_range,
    location: row.location,
    minWorkYears: row.min_work_years || 0,
    educationRequirement: row.education_requirement,
    description: row.description,
    requirements,
    responsibilities: JSON.parse(row.responsibilities_json || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getJobById(id: string): (Job & { requirements: JobRequirement[] }) | null {
  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as any;
  
  if (!row) return null;
  
  return mapJobRow(row);
}

export function createJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
  const id = generateId();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, title, department, industry, salary_range, location,
      min_work_years, education_requirement, description, responsibilities_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.title,
    data.department,
    data.industry,
    data.salaryRange,
    data.location,
    data.minWorkYears,
    data.educationRequirement,
    data.description,
    JSON.stringify(data.responsibilities || []),
    now,
    now
  );
  
  if (data.requirements && data.requirements.length > 0) {
    const insertReq = db.prepare(`
      INSERT INTO job_requirements (id, job_id, skill, required, weight, min_years)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    data.requirements.forEach(req => {
      insertReq.run(
        generateId(),
        id,
        req.skill,
        req.required ? 1 : 0,
        req.weight,
        req.minYears || null
      );
    });
  }
  
  return getJobById(id)!;
}

export function updateJob(id: string, data: Partial<Job>): Job | null {
  const existing = getJobById(id);
  if (!existing) return null;
  
  const now = new Date().toISOString();
  
  const updateFields: string[] = [];
  const params: any[] = [];
  
  if (data.title !== undefined) { updateFields.push('title = ?'); params.push(data.title); }
  if (data.department !== undefined) { updateFields.push('department = ?'); params.push(data.department); }
  if (data.industry !== undefined) { updateFields.push('industry = ?'); params.push(data.industry); }
  if (data.salaryRange !== undefined) { updateFields.push('salary_range = ?'); params.push(data.salaryRange); }
  if (data.location !== undefined) { updateFields.push('location = ?'); params.push(data.location); }
  if (data.minWorkYears !== undefined) { updateFields.push('min_work_years = ?'); params.push(data.minWorkYears); }
  if (data.educationRequirement !== undefined) { updateFields.push('education_requirement = ?'); params.push(data.educationRequirement); }
  if (data.description !== undefined) { updateFields.push('description = ?'); params.push(data.description); }
  if (data.responsibilities !== undefined) { updateFields.push('responsibilities_json = ?'); params.push(JSON.stringify(data.responsibilities)); }
  
  updateFields.push('updated_at = ?');
  params.push(now);
  params.push(id);
  
  if (updateFields.length > 0) {
    db.prepare(`UPDATE jobs SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
  }
  
  if (data.requirements !== undefined) {
    db.prepare('DELETE FROM job_requirements WHERE job_id = ?').run(id);
    
    if (data.requirements.length > 0) {
      const insertReq = db.prepare(`
        INSERT INTO job_requirements (id, job_id, skill, required, weight, min_years)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      data.requirements.forEach(req => {
        insertReq.run(
          generateId(),
          id,
          req.skill,
          req.required ? 1 : 0,
          req.weight,
          req.minYears || null
        );
      });
    }
  }
  
  return getJobById(id);
}

export function deleteJob(id: string): boolean {
  const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getMatchedCandidates(jobId: string, minScore: number = 60): Array<{ candidateId: string; candidateName: string; score: number }> {
  const rows = db.prepare(`
    SELECT 
      mr.candidate_id,
      c.name as candidate_name,
      mr.overall_score as score
    FROM match_reports mr
    INNER JOIN candidates c ON mr.candidate_id = c.id
    WHERE mr.job_id = ? AND mr.overall_score >= ?
    ORDER BY mr.overall_score DESC
  `).all(jobId, minScore) as any[];
  
  return rows.map(row => ({
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    score: row.score
  }));
}

export function getJobCandidateCount(jobId: string): number {
  const result = db.prepare('SELECT COUNT(*) as count FROM match_reports WHERE job_id = ?').get(jobId) as { count: number };
  return result.count;
}
