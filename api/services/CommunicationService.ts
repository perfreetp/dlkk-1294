import { db, generateId } from '../db';
import type { CommunicationRecord } from '../../shared/types';

export function getCommunications(filters?: {
  candidateId?: string;
  type?: string;
  createdBy?: string;
}): CommunicationRecord[] {
  let sql = 'SELECT * FROM communications WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.candidateId) {
    sql += ' AND candidate_id = ?';
    params.push(filters.candidateId);
  }
  
  if (filters?.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }
  
  if (filters?.createdBy) {
    sql += ' AND created_by = ?';
    params.push(filters.createdBy);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const rows = db.prepare(sql).all(...params) as any[];
  
  return rows.map(row => ({
    id: row.id,
    candidateId: row.candidate_id,
    type: row.type,
    content: row.content,
    createdBy: row.created_by,
    createdAt: row.created_at
  }));
}

export function getCommunicationById(id: string): CommunicationRecord | null {
  const row = db.prepare('SELECT * FROM communications WHERE id = ?').get(id) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    candidateId: row.candidate_id,
    type: row.type,
    content: row.content,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

export function createCommunication(data: Omit<CommunicationRecord, 'id' | 'createdAt'>): CommunicationRecord {
  const id = generateId();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO communications (id, candidate_id, type, content, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.candidateId,
    data.type,
    data.content,
    data.createdBy || 'system',
    now
  );
  
  return getCommunicationById(id)!;
}

export function updateCommunication(id: string, content: string): CommunicationRecord | null {
  const existing = getCommunicationById(id);
  if (!existing) return null;
  
  db.prepare('UPDATE communications SET content = ? WHERE id = ?').run(content, id);
  
  return getCommunicationById(id);
}

export function deleteCommunication(id: string): boolean {
  const result = db.prepare('DELETE FROM communications WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getCommunicationStats(): {
  total: number;
  byType: Record<string, number>;
  byDate: Array<{ date: string; count: number }>;
} {
  const total = (db.prepare('SELECT COUNT(*) as count FROM communications').get() as { count: number }).count;
  
  const typeRows = db.prepare('SELECT type, COUNT(*) as count FROM communications GROUP BY type').all() as Array<{ type: string; count: number }>;
  const byType: Record<string, number> = {};
  typeRows.forEach(row => {
    byType[row.type] = row.count;
  });
  
  const dateRows = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM communications 
    GROUP BY DATE(created_at) 
    ORDER BY date DESC 
    LIMIT 7
  `).all() as Array<{ date: string; count: number }>;
  
  return {
    total,
    byType,
    byDate: dateRows.reverse()
  };
}
