import { db, generateId } from '../db';
import { parseResumeText } from './ResumeParserService';
import type { Candidate, CandidateStatus, Skill, Experience } from '../../shared/types';

export function getCandidates(filters?: {
  industry?: string;
  status?: CandidateStatus;
  minWorkYears?: number;
  education?: string;
  search?: string;
}): Candidate[] {
  let sql = 'SELECT * FROM candidates WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.industry) {
    sql += ' AND industry = ?';
    params.push(filters.industry);
  }
  
  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters?.minWorkYears) {
    sql += ' AND total_work_years >= ?';
    params.push(filters.minWorkYears);
  }
  
  if (filters?.education) {
    sql += ' AND education = ?';
    params.push(filters.education);
  }
  
  if (filters?.search) {
    sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const rows = db.prepare(sql).all(...params) as any[];
  
  return rows.map(row => mapCandidateRow(row));
}

function mapCandidateRow(row: any): Candidate {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    education: row.education,
    major: row.major,
    graduationYear: row.graduation_year,
    totalWorkYears: row.total_work_years || 0,
    industry: row.industry,
    skills: JSON.parse(row.skills_json || '[]'),
    experiences: JSON.parse(row.experiences_json || '[]'),
    currentSalary: row.current_salary,
    expectedSalary: row.expected_salary,
    status: row.status,
    consultantNotes: row.consultant_notes,
    recommendationReason: row.recommendation_reason,
    resumeUrl: row.resume_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getCandidateById(id: string): Candidate | null {
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as any;
  
  if (!row) return null;
  
  return mapCandidateRow(row);
}

export function createCandidate(data: Partial<Candidate>): Candidate {
  const id = generateId();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO candidates (
      id, name, phone, email, education, major, graduation_year,
      total_work_years, industry, skills_json, experiences_json,
      current_salary, expected_salary, status, consultant_notes,
      recommendation_reason, resume_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.name || '未命名',
    data.phone || '',
    data.email || '',
    data.education || '',
    data.major || '',
    data.graduationYear || 0,
    data.totalWorkYears || 0,
    data.industry || '',
    JSON.stringify(data.skills || []),
    JSON.stringify(data.experiences || []),
    data.currentSalary || '',
    data.expectedSalary || '',
    data.status || 'pending',
    data.consultantNotes || '',
    data.recommendationReason || '',
    data.resumeUrl || '',
    now,
    now
  );
  
  return getCandidateById(id)!;
}

export function updateCandidate(id: string, data: Partial<Candidate>): Candidate | null {
  const existing = getCandidateById(id);
  if (!existing) return null;
  
  const now = new Date().toISOString();
  
  const updateFields: string[] = [];
  const params: any[] = [];
  
  if (data.name !== undefined) { updateFields.push('name = ?'); params.push(data.name); }
  if (data.phone !== undefined) { updateFields.push('phone = ?'); params.push(data.phone); }
  if (data.email !== undefined) { updateFields.push('email = ?'); params.push(data.email); }
  if (data.education !== undefined) { updateFields.push('education = ?'); params.push(data.education); }
  if (data.major !== undefined) { updateFields.push('major = ?'); params.push(data.major); }
  if (data.graduationYear !== undefined) { updateFields.push('graduation_year = ?'); params.push(data.graduationYear); }
  if (data.totalWorkYears !== undefined) { updateFields.push('total_work_years = ?'); params.push(data.totalWorkYears); }
  if (data.industry !== undefined) { updateFields.push('industry = ?'); params.push(data.industry); }
  if (data.skills !== undefined) { updateFields.push('skills_json = ?'); params.push(JSON.stringify(data.skills)); }
  if (data.experiences !== undefined) { updateFields.push('experiences_json = ?'); params.push(JSON.stringify(data.experiences)); }
  if (data.currentSalary !== undefined) { updateFields.push('current_salary = ?'); params.push(data.currentSalary); }
  if (data.expectedSalary !== undefined) { updateFields.push('expected_salary = ?'); params.push(data.expectedSalary); }
  if (data.status !== undefined) { updateFields.push('status = ?'); params.push(data.status); }
  if (data.consultantNotes !== undefined) { updateFields.push('consultant_notes = ?'); params.push(data.consultantNotes); }
  if (data.recommendationReason !== undefined) { updateFields.push('recommendation_reason = ?'); params.push(data.recommendationReason); }
  if (data.resumeUrl !== undefined) { updateFields.push('resume_url = ?'); params.push(data.resumeUrl); }
  
  updateFields.push('updated_at = ?');
  params.push(now);
  params.push(id);
  
  if (updateFields.length > 0) {
    db.prepare(`UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
  }
  
  return getCandidateById(id);
}

export function updateCandidateStatus(id: string, status: CandidateStatus): Candidate | null {
  return updateCandidate(id, { status });
}

export function addCandidateNote(id: string, note: string): Candidate | null {
  const existing = getCandidateById(id);
  if (!existing) return null;
  
  const newNotes = existing.consultantNotes 
    ? `${existing.consultantNotes}\n\n[${new Date().toLocaleString('zh-CN')}]\n${note}`
    : `[${new Date().toLocaleString('zh-CN')}]\n${note}`;
  
  return updateCandidate(id, { consultantNotes: newNotes });
}

export function deleteCandidate(id: string): boolean {
  const result = db.prepare('DELETE FROM candidates WHERE id = ?').run(id);
  return result.changes > 0;
}

export function parseAndCreateCandidate(resumeText: string, fileName: string): Candidate {
  const parsed = parseResumeText(resumeText);
  
  if (!parsed.name) {
    const nameFromFile = fileName.replace(/\.[^/.]+$/, '');
    parsed.name = nameFromFile || '未知候选人';
  }
  
  return createCandidate({
    ...parsed,
    resumeUrl: fileName
  });
}

export function batchParseAndCreate(resumes: Array<{ text: string; fileName: string }>): Candidate[] {
  const results: Candidate[] = [];
  
  for (const resume of resumes) {
    try {
      const candidate = parseAndCreateCandidate(resume.text, resume.fileName);
      results.push(candidate);
    } catch (error) {
      console.error(`解析简历失败: ${resume.fileName}`, error);
    }
  }
  
  return results;
}
