import { db } from '../db';
import jsPDF from 'jspdf';
import type { Candidate, Job, MatchReport, Template } from '../../shared/types';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateBriefing(
  candidateId: string,
  templateId: string,
  format: 'pdf' | 'html' = 'pdf'
): { success: boolean; filePath?: string; error?: string } {
  try {
    const candidateRow = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId) as any;
    const templateRow = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId) as any;
    const jobRow = db.prepare(`
      SELECT j.* FROM jobs j 
      INNER JOIN match_reports mr ON j.id = mr.job_id 
      WHERE mr.candidate_id = ? 
      ORDER BY mr.created_at DESC LIMIT 1
    `).get(candidateId) as any;
    
    if (!candidateRow) return { success: false, error: '候选人不存在' };
    if (!templateRow) return { success: false, error: '模板不存在' };
    
    const candidate: Candidate = {
      ...candidateRow,
      skills: JSON.parse(candidateRow.skills_json || '[]'),
      experiences: JSON.parse(candidateRow.experiences_json || '[]')
    };
    
    const template: Template = {
      ...templateRow,
      variables: JSON.parse(templateRow.variables_json || '[]')
    };
    
    const matchReport = db.prepare('SELECT * FROM match_reports WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 1').get(candidateId) as any;
    const report: MatchReport | null = matchReport ? {
      candidateId: matchReport.candidate_id,
      jobId: matchReport.job_id,
      overallScore: matchReport.overall_score,
      dimensions: JSON.parse(matchReport.dimensions_json || '[]'),
      missingItems: JSON.parse(matchReport.missing_items_json || '[]'),
      interviewQuestions: JSON.parse(matchReport.interview_questions_json || '[]'),
      summary: matchReport.summary,
      createdAt: matchReport.created_at
    } : null;
    
    const variables = extractTemplateVariables(template.content);
    const data = buildTemplateData(candidate, jobRow, report);
    
    let content = template.content;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, value || '');
    }
    
    const exportDir = path.join(__dirname, '..', '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const fileName = `${candidate.name}_推荐报告_${Date.now()}.${format}`;
    const filePath = path.join(exportDir, fileName);
    
    if (format === 'pdf') {
      generatePDF(content, filePath);
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
    
    db.prepare(`
      INSERT INTO export_logs (id, candidate_id, template_id, format, file_path)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      Math.random().toString(36).substring(2, 15),
      candidateId,
      templateId,
      format,
      filePath
    );
    
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '导出失败' };
  }
}

function extractTemplateVariables(content: string): string[] {
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

function buildTemplateData(
  candidate: Candidate,
  job: Job | null,
  report: MatchReport | null
): Record<string, string> {
  const data: Record<string, string> = {};
  
  data['候选人姓名'] = candidate.name;
  data['学历'] = candidate.education;
  data['专业'] = candidate.major;
  data['工作年限'] = String(candidate.totalWorkYears);
  data['当前薪资'] = candidate.currentSalary;
  data['期望薪资'] = candidate.expectedSalary;
  data['行业'] = candidate.industry;
  data['电话'] = candidate.phone;
  data['邮箱'] = candidate.email;
  data['毕业年份'] = String(candidate.graduationYear);
  data['求职状态'] = candidate.status;
  
  data['核心技能'] = candidate.skills
    .map(s => `${s.name}(${s.years}年)`)
    .join('、');
  
  data['主要经历'] = candidate.experiences
    .map(exp => `${exp.startDate}-${exp.endDate} ${exp.company} ${exp.position}`)
    .join('\n');
  
  data['管理经验'] = String(Math.max(0, candidate.totalWorkYears - 3));
  data['顾问姓名'] = '系统顾问';
  data['推荐日期'] = new Date().toLocaleDateString('zh-CN');
  
  if (job) {
    data['目标岗位'] = job.title;
    data['目标行业'] = job.industry;
    data['岗位薪资'] = job.salaryRange;
    data['岗位地点'] = job.location;
  }
  
  if (report) {
    data['匹配分'] = String(report.overallScore);
    data['匹配摘要'] = report.summary;
    data['缺失经历'] = report.missingItems
      .map(m => `${m.name}(${m.impact === 'high' ? '高' : m.impact === 'medium' ? '中' : '低'})`)
      .join('、');
    data['面试追问点'] = report.interviewQuestions
      .map((q, i) => `<li>${q.question}</li>`)
      .join('\n');
  }
  
  data['推荐理由'] = candidate.recommendationReason || '暂无';
  data['顾问备注'] = candidate.consultantNotes || '暂无';
  
  return data;
}

function generatePDF(htmlContent: string, filePath: string): void {
  const doc = new jsPDF();
  
  const textContent = htmlContent
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  
  const lines = doc.splitTextToSize(textContent, 180);
  let y = 20;
  
  lines.forEach((line: string, index: number) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    if (line.startsWith('##') || line.startsWith('###')) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      line = line.replace(/#+/g, '').trim();
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(line, 15, y);
    y += line.includes('##') ? 12 : 7;
  });
  
  doc.save(filePath);
}

export function previewTemplate(templateId: string, candidateId: string): { success: boolean; content?: string; error?: string } {
  try {
    const result = generateBriefing(candidateId, templateId, 'html');
    if (result.success && result.filePath) {
      const content = fs.readFileSync(result.filePath, 'utf-8');
      fs.unlinkSync(result.filePath);
      return { success: true, content };
    }
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '预览失败' };
  }
}

export function getExportFilePath(fileName: string): string | null {
  const exportDir = path.join(__dirname, '..', '..', 'exports');
  const filePath = path.join(exportDir, fileName);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  return null;
}
