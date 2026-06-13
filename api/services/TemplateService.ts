import { db, generateId } from '../db';
import type { Template } from '../../shared/types';

export function getTemplates(filters?: {
  clientName?: string;
  search?: string;
}): Template[] {
  let sql = 'SELECT * FROM templates WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.clientName) {
    sql += ' AND client_name = ?';
    params.push(filters.clientName);
  }
  
  if (filters?.search) {
    sql += ' AND (name LIKE ? OR content LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const rows = db.prepare(sql).all(...params) as any[];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    content: row.content,
    variables: JSON.parse(row.variables_json || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function getTemplateById(id: string): Template | null {
  const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    content: row.content,
    variables: JSON.parse(row.variables_json || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
  const id = generateId();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO templates (id, name, client_name, content, variables_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.name,
    data.clientName,
    data.content,
    JSON.stringify(data.variables || extractVariablesFromContent(data.content)),
    now,
    now
  );
  
  return getTemplateById(id)!;
}

export function updateTemplate(id: string, data: Partial<Template>): Template | null {
  const existing = getTemplateById(id);
  if (!existing) return null;
  
  const now = new Date().toISOString();
  
  const updateFields: string[] = [];
  const params: any[] = [];
  
  if (data.name !== undefined) { updateFields.push('name = ?'); params.push(data.name); }
  if (data.clientName !== undefined) { updateFields.push('client_name = ?'); params.push(data.clientName); }
  if (data.content !== undefined) {
    updateFields.push('content = ?');
    params.push(data.content);
    updateFields.push('variables_json = ?');
    params.push(JSON.stringify(data.variables || extractVariablesFromContent(data.content)));
  }
  
  updateFields.push('updated_at = ?');
  params.push(now);
  params.push(id);
  
  if (updateFields.length > 0) {
    db.prepare(`UPDATE templates SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
  }
  
  return getTemplateById(id);
}

export function deleteTemplate(id: string): boolean {
  const result = db.prepare('DELETE FROM templates WHERE id = ?').run(id);
  return result.changes > 0;
}

function extractVariablesFromContent(content: string): string[] {
  const regex = /{{\s*([^}]+)\s*}}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}

export function getTemplateVariables(content: string): string[] {
  return extractVariablesFromContent(content);
}
