export type CandidateStatus = 
  | 'pending'
  | 'recommended'
  | 'interview'
  | 'hired'
  | 'rejected';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  years: number;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  education: string;
  major: string;
  graduationYear: number;
  totalWorkYears: number;
  industry: string;
  skills: Skill[];
  experiences: Experience[];
  currentSalary: string;
  expectedSalary: string;
  status: CandidateStatus;
  consultantNotes: string;
  recommendationReason: string;
  resumeUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobRequirement {
  skill: string;
  required: boolean;
  weight: number;
  minYears?: number;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  industry: string;
  salaryRange: string;
  location: string;
  minWorkYears: number;
  educationRequirement: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchDimension {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MissingItem {
  type: 'skill' | 'experience' | 'education';
  name: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface InterviewQuestion {
  category: string;
  question: string;
  purpose: string;
}

export interface MatchReport {
  candidateId: string;
  jobId: string;
  overallScore: number;
  dimensions: MatchDimension[];
  missingItems: MissingItem[];
  interviewQuestions: InterviewQuestion[];
  summary: string;
  createdAt: string;
}

export interface CommunicationRecord {
  id: string;
  candidateId: string;
  type: 'note' | 'call' | 'email' | 'interview';
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  clientName: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PagedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  pending: '待评估',
  recommended: '已推荐',
  interview: '面试中',
  hired: '已录用',
  rejected: '已淘汰'
};

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  recommended: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700'
};

export const INDUSTRIES = [
  '互联网/IT',
  '金融',
  '制造业',
  '医疗健康',
  '教育',
  '零售电商',
  '房地产',
  '汽车',
  '能源',
  '其他'
];

export const EDUCATION_LEVELS = ['大专', '本科', '硕士', '博士', 'MBA'];
