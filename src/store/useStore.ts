import { create } from 'zustand';
import type {
  Candidate,
  CandidateStatus,
  Job,
  MatchReport,
  CommunicationRecord,
  Template,
} from '../../shared/types';
import {
  candidateApi,
  jobApi,
  matchApi,
  communicationApi,
  templateApi,
} from '../lib/api';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  jobs: Job[];
  selectedJob: Job | null;
  matchReports: MatchReport[];
  selectedMatchReport: MatchReport | null;
  communications: CommunicationRecord[];
  templates: Template[];
  toasts: Toast[];
  loading: Record<string, boolean>;

  fetchCandidates: (filters?: {
    industry?: string;
    status?: CandidateStatus;
    minWorkYears?: number;
    education?: string;
    search?: string;
  }) => Promise<void>;
  fetchCandidateById: (id: string) => Promise<void>;
  uploadResumes: (files: File[]) => Promise<Candidate[] | null>;
  updateCandidateStatus: (
    id: string,
    status: CandidateStatus
  ) => Promise<void>;
  addCandidateNote: (id: string, note: string) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  updateCandidate: (id: string, data: Partial<Candidate>) => Promise<void>;

  fetchJobs: (filters?: { industry?: string; search?: string }) => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  createJob: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  getMatchReport: (candidateId: string, jobId: string) => Promise<void>;
  batchCalculateMatch: (candidateIds: string[], jobId: string) => Promise<void>;

  fetchCommunications: (filters?: {
    candidateId?: string;
    type?: string;
    createdBy?: string;
  }) => Promise<void>;
  createCommunication: (
    data: Omit<CommunicationRecord, 'id' | 'createdAt'>
  ) => Promise<void>;
  deleteCommunication: (id: string) => Promise<void>;

  fetchTemplates: (filters?: {
    clientName?: string;
    search?: string;
  }) => Promise<void>;
  createTemplate: (
    data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateTemplate: (id: string, data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  setSelectedCandidate: (candidate: Candidate | null) => void;
  setSelectedJob: (job: Job | null) => void;
  setSelectedMatchReport: (report: MatchReport | null) => void;
  setMatchReports: (reports: MatchReport[]) => void;

  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;

  setLoading: (key: string, value: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useStore = create<AppState>((set, get) => ({
  candidates: [],
  selectedCandidate: null,
  jobs: [],
  selectedJob: null,
  matchReports: [],
  selectedMatchReport: null,
  communications: [],
  templates: [],
  toasts: [],
  loading: {},

  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  addToast: (type, message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setSelectedCandidate: (candidate) =>
    set({ selectedCandidate: candidate }),

  setSelectedJob: (job) => set({ selectedJob: job }),

  setSelectedMatchReport: (report) => set({ selectedMatchReport: report }),

  setMatchReports: (reports) => set({ matchReports: reports }),

  fetchCandidates: async (filters) => {
    get().setLoading('candidates', true);
    try {
      const response = await candidateApi.getCandidates(filters);
      if (response.success && response.data) {
        set({ candidates: response.data });
      } else {
        get().addToast('error', response.error || '获取候选人列表失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('candidates', false);
    }
  },

  fetchCandidateById: async (id) => {
    get().setLoading('candidate', true);
    try {
      const response = await candidateApi.getCandidateById(id);
      if (response.success && response.data) {
        set({ selectedCandidate: response.data });
      } else {
        get().addToast('error', response.error || '获取候选人详情失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('candidate', false);
    }
  },

  uploadResumes: async (files) => {
    get().setLoading('upload', true);
    try {
      const response = await candidateApi.uploadResumes(files);
      if (response.success && response.data) {
        get().addToast('success', response.message || `成功解析 ${response.data.length} 份简历`);
        set((state) => ({
          candidates: [...response.data, ...state.candidates],
        }));
        return response.data;
      } else {
        get().addToast('error', response.error || '上传简历失败');
        return null;
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
      return null;
    } finally {
      get().setLoading('upload', false);
    }
  },

  updateCandidateStatus: async (id, status) => {
    get().setLoading('status', true);
    try {
      const response = await candidateApi.updateCandidateStatus(id, status);
      if (response.success && response.data) {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? response.data! : c
          ),
          selectedCandidate:
            state.selectedCandidate?.id === id
              ? response.data
              : state.selectedCandidate,
        }));
        get().addToast('success', response.message || '状态更新成功');
      } else {
        get().addToast('error', response.error || '更新状态失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('status', false);
    }
  },

  addCandidateNote: async (id, note) => {
    get().setLoading('note', true);
    try {
      const response = await candidateApi.addCandidateNote(id, note);
      if (response.success && response.data) {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? response.data! : c
          ),
          selectedCandidate:
            state.selectedCandidate?.id === id
              ? response.data
              : state.selectedCandidate,
        }));
        get().addToast('success', response.message || '备注添加成功');
      } else {
        get().addToast('error', response.error || '添加备注失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('note', false);
    }
  },

  deleteCandidate: async (id) => {
    get().setLoading('delete', true);
    try {
      const response = await candidateApi.deleteCandidate(id);
      if (response.success) {
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
          selectedCandidate:
            state.selectedCandidate?.id === id ? null : state.selectedCandidate,
        }));
        get().addToast('success', response.message || '候选人删除成功');
      } else {
        get().addToast('error', response.error || '删除候选人失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('delete', false);
    }
  },

  updateCandidate: async (id, data) => {
    get().setLoading('update', true);
    try {
      const response = await candidateApi.updateCandidate(id, data);
      if (response.success && response.data) {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? response.data! : c
          ),
          selectedCandidate:
            state.selectedCandidate?.id === id
              ? response.data
              : state.selectedCandidate,
        }));
        get().addToast('success', response.message || '候选人信息更新成功');
      } else {
        get().addToast('error', response.error || '更新候选人失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('update', false);
    }
  },

  fetchJobs: async (filters) => {
    get().setLoading('jobs', true);
    try {
      const response = await jobApi.getJobs(filters);
      if (response.success && response.data) {
        set({ jobs: response.data });
      } else {
        get().addToast('error', response.error || '获取岗位列表失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('jobs', false);
    }
  },

  fetchJobById: async (id) => {
    get().setLoading('job', true);
    try {
      const response = await jobApi.getJobById(id);
      if (response.success && response.data) {
        set({ selectedJob: response.data });
      } else {
        get().addToast('error', response.error || '获取岗位详情失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('job', false);
    }
  },

  createJob: async (data) => {
    get().setLoading('createJob', true);
    try {
      const response = await jobApi.createJob(data);
      if (response.success && response.data) {
        set((state) => ({
          jobs: [response.data!, ...state.jobs],
        }));
        get().addToast('success', response.message || '岗位创建成功');
      } else {
        get().addToast('error', response.error || '创建岗位失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('createJob', false);
    }
  },

  updateJob: async (id, data) => {
    get().setLoading('updateJob', true);
    try {
      const response = await jobApi.updateJob(id, data);
      if (response.success && response.data) {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? response.data! : j)),
          selectedJob:
            state.selectedJob?.id === id ? response.data : state.selectedJob,
        }));
        get().addToast('success', response.message || '岗位更新成功');
      } else {
        get().addToast('error', response.error || '更新岗位失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('updateJob', false);
    }
  },

  deleteJob: async (id) => {
    get().setLoading('deleteJob', true);
    try {
      const response = await jobApi.deleteJob(id);
      if (response.success) {
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
          selectedJob: state.selectedJob?.id === id ? null : state.selectedJob,
        }));
        get().addToast('success', response.message || '岗位删除成功');
      } else {
        get().addToast('error', response.error || '删除岗位失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('deleteJob', false);
    }
  },

  getMatchReport: async (candidateId, jobId) => {
    get().setLoading('match', true);
    try {
      const response = await matchApi.getMatchReport(candidateId, jobId);
      if (response.success && response.data) {
        set({ 
          selectedMatchReport: response.data,
          matchReports: [],
        });
        get().addToast('success', '匹配报告生成成功');
      } else {
        get().addToast('error', response.error || '获取匹配报告失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('match', false);
    }
  },

  batchCalculateMatch: async (candidateIds, jobId) => {
    get().setLoading('batchMatch', true);
    try {
      const response = await matchApi.batchCalculateMatch(candidateIds, jobId);
      if (response.success && response.data) {
        set({ 
          matchReports: response.data,
          selectedMatchReport: null,
        });
        get().addToast('success', response.message || '批量匹配完成');
      } else {
        get().addToast('error', response.error || '批量匹配失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('batchMatch', false);
    }
  },

  fetchCommunications: async (filters) => {
    get().setLoading('communications', true);
    try {
      const response = await communicationApi.getCommunications(filters);
      if (response.success && response.data) {
        set({ communications: response.data });
      } else {
        get().addToast('error', response.error || '获取沟通记录失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('communications', false);
    }
  },

  createCommunication: async (data) => {
    get().setLoading('createComm', true);
    try {
      const response = await communicationApi.createCommunication(data);
      if (response.success && response.data) {
        set((state) => ({
          communications: [response.data!, ...state.communications],
        }));
        get().addToast('success', response.message || '沟通记录创建成功');
      } else {
        get().addToast('error', response.error || '创建沟通记录失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('createComm', false);
    }
  },

  deleteCommunication: async (id) => {
    get().setLoading('deleteComm', true);
    try {
      const response = await communicationApi.deleteCommunication(id);
      if (response.success) {
        set((state) => ({
          communications: state.communications.filter((c) => c.id !== id),
        }));
        get().addToast('success', response.message || '沟通记录删除成功');
      } else {
        get().addToast('error', response.error || '删除沟通记录失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('deleteComm', false);
    }
  },

  fetchTemplates: async (filters) => {
    get().setLoading('templates', true);
    try {
      const response = await templateApi.getTemplates(filters);
      if (response.success && response.data) {
        set({ templates: response.data });
      } else {
        get().addToast('error', response.error || '获取模板列表失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('templates', false);
    }
  },

  createTemplate: async (data) => {
    get().setLoading('createTemplate', true);
    try {
      const response = await templateApi.createTemplate(data);
      if (response.success && response.data) {
        set((state) => ({
          templates: [response.data!, ...state.templates],
        }));
        get().addToast('success', response.message || '模板创建成功');
      } else {
        get().addToast('error', response.error || '创建模板失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('createTemplate', false);
    }
  },

  updateTemplate: async (id, data) => {
    get().setLoading('updateTemplate', true);
    try {
      const response = await templateApi.updateTemplate(id, data);
      if (response.success && response.data) {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? response.data! : t
          ),
        }));
        get().addToast('success', response.message || '模板更新成功');
      } else {
        get().addToast('error', response.error || '更新模板失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('updateTemplate', false);
    }
  },

  deleteTemplate: async (id) => {
    get().setLoading('deleteTemplate', true);
    try {
      const response = await templateApi.deleteTemplate(id);
      if (response.success) {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
        get().addToast('success', response.message || '模板删除成功');
      } else {
        get().addToast('error', response.error || '删除模板失败');
      }
    } catch (error) {
      get().addToast('error', '网络错误，请稍后重试');
    } finally {
      get().setLoading('deleteTemplate', false);
    }
  },
}));
