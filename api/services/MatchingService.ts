import { db } from '../db';
import { matchSkills } from './ResumeParserService';
import type { Candidate, Job, MatchReport, MatchDimension, MissingItem, InterviewQuestion, JobRequirement } from '../../shared/types';

const EDUCATION_SCORES: Record<string, number> = {
  '大专': 60,
  '本科': 80,
  '硕士': 90,
  '博士': 100,
  'MBA': 95
};

export function calculateMatch(candidateId: string, jobId: string): MatchReport {
  const candidateRow = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId) as any;
  const jobRow = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as any;
  
  if (!candidateRow || !jobRow) {
    throw new Error('Candidate or job not found');
  }
  
  const candidate: Candidate = {
    ...candidateRow,
    skills: JSON.parse(candidateRow.skills_json || '[]'),
    experiences: JSON.parse(candidateRow.experiences_json || '[]')
  };
  
  const job: Job & { requirements: JobRequirement[] } = {
    ...jobRow,
    requirements: db.prepare('SELECT skill, required, weight, min_years as minYears FROM job_requirements WHERE job_id = ?').all(jobId) as JobRequirement[],
    responsibilities: JSON.parse(jobRow.responsibilities_json || '[]')
  };
  
  const dimensions: MatchDimension[] = [];
  let totalScore = 0;
  let totalWeight = 0;
  
  const skillMatch = matchSkills(candidate.skills, job.requirements);
  dimensions.push({
    name: '技能匹配',
    score: skillMatch.score,
    maxScore: 100,
    description: `已匹配 ${skillMatch.matched.length} 项技能`
  });
  totalScore += skillMatch.score * 0.4;
  totalWeight += 40;
  
  const experienceScore = calculateExperienceScore(candidate, job);
  dimensions.push({
    name: '工作经验',
    score: experienceScore,
    maxScore: 100,
    description: candidate.totalWorkYears >= job.minWorkYears 
      ? `满足${job.minWorkYears}年工作经验要求` 
      : `当前${candidate.totalWorkYears}年，要求${job.minWorkYears}年`
  });
  totalScore += experienceScore * 0.3;
  totalWeight += 30;
  
  const educationScore = calculateEducationScore(candidate, job);
  dimensions.push({
    name: '学历背景',
    score: educationScore,
    maxScore: 100,
    description: `${candidate.education} vs 要求${job.educationRequirement}`
  });
  totalScore += educationScore * 0.15;
  totalWeight += 15;
  
  const industryScore = calculateIndustryScore(candidate, job);
  dimensions.push({
    name: '行业匹配',
    score: industryScore,
    maxScore: 100,
    description: candidate.industry === job.industry ? '行业完全匹配' : `候选人:${candidate.industry} vs 岗位:${job.industry}`
  });
  totalScore += industryScore * 0.15;
  totalWeight += 15;
  
  const overallScore = Math.round(totalScore);
  
  const missingItems = generateMissingItems(candidate, job, skillMatch.missing);
  const interviewQuestions = generateInterviewQuestions(candidate, job, missingItems);
  const summary = generateSummary(candidate, job, overallScore, dimensions);
  
  const existing = db.prepare('SELECT id FROM match_reports WHERE candidate_id = ? AND job_id = ?').get(candidateId, jobId);
  
  if (existing) {
    db.prepare(`
      UPDATE match_reports 
      SET overall_score = ?, dimensions_json = ?, missing_items_json = ?, interview_questions_json = ?, summary = ?
      WHERE candidate_id = ? AND job_id = ?
    `).run(
      overallScore,
      JSON.stringify(dimensions),
      JSON.stringify(missingItems),
      JSON.stringify(interviewQuestions),
      summary,
      candidateId,
      jobId
    );
  } else {
    db.prepare(`
      INSERT INTO match_reports (id, candidate_id, job_id, overall_score, dimensions_json, missing_items_json, interview_questions_json, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      Math.random().toString(36).substring(2, 15),
      candidateId,
      jobId,
      overallScore,
      JSON.stringify(dimensions),
      JSON.stringify(missingItems),
      JSON.stringify(interviewQuestions),
      summary
    );
  }
  
  return {
    candidateId,
    jobId,
    overallScore,
    dimensions,
    missingItems,
    interviewQuestions,
    summary,
    createdAt: new Date().toISOString()
  };
}

function calculateExperienceScore(candidate: Candidate, job: Job): number {
  const required = job.minWorkYears || 0;
  const actual = candidate.totalWorkYears || 0;
  
  if (actual >= required) {
    return Math.min(80 + (actual - required) * 5, 100);
  }
  
  if (actual >= required * 0.7) {
    return 60 + ((actual / required) * 20);
  }
  
  return Math.max(30, (actual / required) * 60);
}

function calculateEducationScore(candidate: Candidate, job: Job): number {
  const candidateScore = EDUCATION_SCORES[candidate.education] || 50;
  const requiredScore = EDUCATION_SCORES[job.educationRequirement] || 60;
  
  if (candidateScore >= requiredScore) {
    return Math.min(candidateScore + 5, 100);
  }
  
  return Math.max(40, candidateScore * 0.8);
}

function calculateIndustryScore(candidate: Candidate, job: Job): number {
  if (!candidate.industry || !job.industry) return 70;
  if (candidate.industry === job.industry) return 100;
  
  const relatedIndustries: Record<string, string[]> = {
    '互联网/IT': ['零售电商', '教育', '金融'],
    '金融': ['互联网/IT', '房地产'],
    '零售电商': ['互联网/IT', '教育'],
    '制造业': ['汽车', '能源'],
    '汽车': ['制造业', '能源'],
    '房地产': ['金融', '制造业']
  };
  
  if (relatedIndustries[job.industry]?.includes(candidate.industry)) {
    return 75;
  }
  
  return 50;
}

function generateMissingItems(candidate: Candidate, job: Job, missingSkills: Array<{name: string; impact: 'high' | 'medium' | 'low'}>): MissingItem[] {
  const items: MissingItem[] = [];
  
  missingSkills.forEach(ms => {
    items.push({
      type: 'skill',
      name: ms.name,
      impact: ms.impact,
      description: `岗位要求掌握${ms.name}技术，候选人简历中未体现相关经验`
    });
  });
  
  if (candidate.totalWorkYears < job.minWorkYears) {
    items.push({
      type: 'experience',
      name: '工作年限不足',
      impact: 'high',
      description: `岗位要求${job.minWorkYears}年工作经验，候选人仅${candidate.totalWorkYears}年`
    });
  }
  
  const eduOrder = ['大专', '本科', '硕士', '博士', 'MBA'];
  const candidateEduIndex = eduOrder.indexOf(candidate.education);
  const requiredEduIndex = eduOrder.indexOf(job.educationRequirement);
  
  if (candidateEduIndex < requiredEduIndex && requiredEduIndex > 0) {
    items.push({
      type: 'education',
      name: '学历不达标',
      impact: 'medium',
      description: `岗位要求${job.educationRequirement}，候选人为${candidate.education}`
    });
  }
  
  if (candidate.industry !== job.industry) {
    items.push({
      type: 'experience',
      name: '行业经验差异',
      impact: 'low',
      description: `候选人来自${candidate.industry}行业，岗位属于${job.industry}行业`
    });
  }
  
  return items;
}

function generateInterviewQuestions(candidate: Candidate, job: Job, missingItems: MissingItem[]): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  
  const topSkills = candidate.skills.slice(0, 3);
  topSkills.forEach(skill => {
    questions.push({
      category: '技术深度',
      question: `请详细介绍你在${skill.name}方面的项目经验，你认为最有挑战性的是什么？`,
      purpose: `考察${skill.name}的实际应用能力和技术深度`
    });
  });
  
  missingItems.filter(m => m.impact === 'high').forEach(missing => {
    questions.push({
      category: '能力补全',
      question: `我们注意到你在${missing.name}方面经验较少，你如何评价自己这方面的能力？是否有学习计划？`,
      purpose: `了解候选人对自身短板的认知和学习能力`
    });
  });
  
  if (candidate.experiences.length > 0) {
    const latestExp = candidate.experiences[0];
    questions.push({
      category: '项目经历',
      question: `请介绍一下你在${latestExp.company}担任${latestExp.position}期间最有成就感的一个项目，你的角色和贡献是什么？`,
      purpose: '考察项目经验、问题解决能力和沟通表达'
    });
  }
  
  questions.push({
    category: '求职动机',
    question: `你为什么对${job.title}这个岗位感兴趣？你认为自己能为我们带来什么价值？`,
    purpose: '了解求职动机和自我认知'
  });
  
  questions.push({
    category: '团队协作',
    question: '请描述一次你在团队中遇到冲突的经历，你是如何解决的？',
    purpose: '考察沟通能力和团队协作能力'
  });
  
  const relatedReqs = job.requirements.filter(r => r.required).slice(0, 2);
  relatedReqs.forEach(req => {
    const hasSkill = candidate.skills.some(s => s.name.toLowerCase() === req.skill.toLowerCase());
    if (hasSkill) {
      questions.push({
        category: '专业技能',
        question: `${req.skill}是本岗位的核心要求，请分享一个你使用${req.skill}解决复杂问题的具体案例。`,
        purpose: `深入考察${req.skill}的实战能力`
      });
    }
  });
  
  return questions;
}

function generateSummary(candidate: Candidate, job: Job, score: number, dimensions: MatchDimension[]): string {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  dimensions.forEach(d => {
    if (d.score >= 80) {
      strengths.push(`${d.name}优秀(${d.score}分)`);
    } else if (d.score < 60) {
      weaknesses.push(`${d.name}待提升(${d.score}分)`);
    }
  });
  
  if (strengths.length === 0) strengths.push('综合条件符合岗位基本要求');
  if (weaknesses.length === 0) weaknesses.push('暂无明显短板');
  
  let recommendation = '待进一步评估';
  if (score >= 85) recommendation = '强烈推荐，各项指标优秀';
  else if (score >= 70) recommendation = '推荐，核心条件匹配';
  else if (score >= 60) recommendation = '可考虑，需重点关注短板';
  else recommendation = '暂不推荐，差距较大';
  
  return `${candidate.name}，${candidate.education}学历，${candidate.totalWorkYears}年${candidate.industry}行业经验。${recommendation}。优势：${strengths.join('、')}。待关注：${weaknesses.join('、')}。`;
}

export function batchCalculateMatch(candidateIds: string[], jobId: string): Array<{ candidateId: string; score: number }> {
  return candidateIds.map(cid => {
    const report = calculateMatch(cid, jobId);
    return { candidateId: cid, score: report.overallScore };
  });
}

export function getMatchReport(candidateId: string, jobId: string): MatchReport | null {
  const existing = db.prepare('SELECT * FROM match_reports WHERE candidate_id = ? AND job_id = ?').get(candidateId, jobId) as any;
  
  if (existing) {
    return {
      candidateId: existing.candidate_id,
      jobId: existing.job_id,
      overallScore: existing.overall_score,
      dimensions: JSON.parse(existing.dimensions_json || '[]'),
      missingItems: JSON.parse(existing.missing_items_json || '[]'),
      interviewQuestions: JSON.parse(existing.interview_questions_json || '[]'),
      summary: existing.summary,
      createdAt: existing.created_at
    };
  }
  
  return null;
}
