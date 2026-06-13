import type {
  Candidate,
  CandidateStatus,
  Job,
  MatchReport,
  CommunicationRecord,
  Template,
  ApiResponse,
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;
  
  const defaultHeaders: Record<string, string> = {};
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();
  return data as ApiResponse<T>;
}

export const candidateApi = {
  getCandidates: (filters?: {
    industry?: string;
    status?: CandidateStatus;
    minWorkYears?: number;
    education?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<Candidate[]>(
      `/candidates${queryString ? `?${queryString}` : ''}`
    );
  },

  getCandidateById: (id: string) =>
    request<Candidate>(`/candidates/${id}`),

  createCandidate: (data: Partial<Candidate>) =>
    request<Candidate>(`/candidates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCandidate: (id: string, data: Partial<Candidate>) =>
    request<Candidate>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateCandidateStatus: (id: string, status: CandidateStatus) =>
    request<Candidate>(`/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  addCandidateNote: (id: string, note: string) =>
    request<Candidate>(`/candidates/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  deleteCandidate: (id: string) =>
    request<void>(`/candidates/${id}`, {
      method: 'DELETE',
    }),

  uploadResumes: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('resumes', file);
    });
    return request<Candidate[]>(`/candidates/upload`, {
      method: 'POST',
      headers: {},
      body: formData as unknown as BodyInit,
    });
  },
};

export const jobApi = {
  getJobs: (filters?: { industry?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<Job[]>(`/jobs${queryString ? `?${queryString}` : ''}`);
  },

  getJobById: (id: string) => request<Job>(`/jobs/${id}`),

  getMatchedCandidates: (jobId: string, minScore = 60) =>
    request<Candidate[]>(`/jobs/${jobId}/matched-candidates?minScore=${minScore}`),

  createJob: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Job>(`/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateJob: (id: string, data: Partial<Job>) =>
    request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteJob: (id: string) =>
    request<void>(`/jobs/${id}`, {
      method: 'DELETE',
    }),
};

export const matchApi = {
  getMatchReport: (candidateId: string, jobId: string) =>
    request<MatchReport>(`/match/${candidateId}/${jobId}`),

  batchCalculateMatch: (candidateIds: string[], jobId: string) =>
    request<MatchReport[]>(`/match/batch`, {
      method: 'POST',
      body: JSON.stringify({ candidateIds, jobId }),
    }),
};

export const communicationApi = {
  getCommunications: (filters?: {
    candidateId?: string;
    type?: string;
    createdBy?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<CommunicationRecord[]>(
      `/communications${queryString ? `?${queryString}` : ''}`
    );
  },

  getStats: () => request<Record<string, number>>(`/communications/stats`),

  getCommunicationById: (id: string) =>
    request<CommunicationRecord>(`/communications/${id}`),

  createCommunication: (
    data: Omit<CommunicationRecord, 'id' | 'createdAt'>
  ) =>
    request<CommunicationRecord>(`/communications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCommunication: (id: string, content: string) =>
    request<CommunicationRecord>(`/communications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteCommunication: (id: string) =>
    request<void>(`/communications/${id}`, {
      method: 'DELETE',
    }),
};

export const templateApi = {
  getTemplates: (filters?: { clientName?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<Template[]>(`/templates${queryString ? `?${queryString}` : ''}`);
  },

  getTemplateVariables: (content: string) =>
    request<string[]>(`/templates/variables?content=${encodeURIComponent(content)}`),

  getTemplateById: (id: string) => request<Template>(`/templates/${id}`),

  previewTemplate: (templateId: string, candidateId: string) =>
    request<string>(`/templates/${templateId}/preview/${candidateId}`),

  createTemplate: (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Template>(`/templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (id: string, data: Partial<Template>) =>
    request<Template>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTemplate: (id: string) =>
    request<void>(`/templates/${id}`, {
      method: 'DELETE',
    }),
};

export const exportApi = {
  generateBriefing: (
    candidateId: string,
    templateId: string,
    format: 'pdf' | 'html' = 'pdf'
  ) =>
    request<{ fileName: string; downloadUrl: string }>(`/export/briefing`, {
      method: 'POST',
      body: JSON.stringify({ candidateId, templateId, format }),
    }),

  downloadFile: (fileName: string) => {
    window.open(`${API_BASE}/export/download/${fileName}`, '_blank');
  },
};
