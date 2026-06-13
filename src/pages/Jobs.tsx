import { useState, useEffect } from 'react';
import { 
  Plus, Search, MoreHorizontal, Trash2, Edit, Eye,
  Building2, MapPin, DollarSign, Clock, GraduationCap, Briefcase, X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { INDUSTRIES, EDUCATION_LEVELS } from '../../shared/types';
import type { Job, JobRequirement } from '../../shared/types';

export function Jobs() {
  const { 
    jobs, 
    selectedJob,
    loading, 
    fetchJobs, 
    createJob, 
    updateJob,
    deleteJob,
    setSelectedJob,
    addToast 
  } = useStore();

  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    department: '',
    industry: INDUSTRIES[0],
    salaryRange: '',
    location: '',
    minWorkYears: 0,
    educationRequirement: EDUCATION_LEVELS[0],
    description: '',
    requirements: [],
    responsibilities: [],
  });
  const [newRequirement, setNewRequirement] = useState({ skill: '', required: true, weight: 5, minYears: 1 });
  const [newResponsibility, setNewResponsibility] = useState('');

  useEffect(() => {
    fetchJobs({
      industry: industryFilter || undefined,
      search: search || undefined,
    });
  }, [industryFilter, search]);

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      industry: INDUSTRIES[0],
      salaryRange: '',
      location: '',
      minWorkYears: 0,
      educationRequirement: EDUCATION_LEVELS[0],
      description: '',
      requirements: [],
      responsibilities: [],
    });
    setNewRequirement({ skill: '', required: true, weight: 5, minYears: 1 });
    setNewResponsibility('');
  };

  const handleCreate = async () => {
    if (!formData.title?.trim()) {
      addToast('warning', '请输入岗位名称');
      return;
    }
    if (!formData.requirements || formData.requirements.length === 0) {
      addToast('warning', '请至少添加一个岗位要求');
      return;
    }
    
    await createJob(formData as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (selectedJob) {
      await updateJob(selectedJob.id, formData);
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个岗位吗？')) {
      await deleteJob(id);
    }
  };

  const openDetailModal = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setFormData(job);
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const addRequirement = () => {
    if (!newRequirement.skill.trim()) {
      addToast('warning', '请输入技能名称');
      return;
    }
    setFormData({
      ...formData,
      requirements: [...(formData.requirements || []), { ...newRequirement }],
    });
    setNewRequirement({ skill: '', required: true, weight: 5, minYears: 1 });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements?.filter((_, i) => i !== index),
    });
  };

  const addResponsibility = () => {
    if (!newResponsibility.trim()) {
      addToast('warning', '请输入职责描述');
      return;
    }
    setFormData({
      ...formData,
      responsibilities: [...(formData.responsibilities || []), newResponsibility],
    });
    setNewResponsibility('');
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">岗位库</h1>
          <p className="text-slate-500 mt-1">管理和维护所有招聘岗位要求</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          新增岗位
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">总岗位数</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{jobs.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">互联网/IT</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">
            {jobs.filter(j => j.industry === '互联网/IT').length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">金融</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {jobs.filter(j => j.industry === '金融').length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">制造业</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {jobs.filter(j => j.industry === '制造业').length}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索岗位名称、部门、地点..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">全部行业</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {loading.jobs ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="暂无岗位"
          description="创建岗位需求开始匹配候选人"
          action={{
            label: '创建岗位',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="card p-5 hover:border-primary-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">{job.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{job.department}</p>
                </div>
                <div className="relative group">
                  <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => openDetailModal(job)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-lg"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                    <button
                      onClick={() => openEditModal(job)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      编辑岗位
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{job.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span>{job.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{job.minWorkYears} 年以上经验</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>{job.educationRequirement} 以上</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">技能要求</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.slice(0, 5).map((req, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        req.required
                          ? 'bg-primary-50 text-primary-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {req.skill}
                    </span>
                  ))}
                  {job.requirements.length > 5 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                      +{job.requirements.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="创建新岗位"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleCreate} className="btn-primary">
              创建岗位
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">岗位名称 *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="例如：高级前端工程师"
              />
            </div>
            <div>
              <label className="label">所属部门</label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input"
                placeholder="例如：技术部"
              />
            </div>
            <div>
              <label className="label">行业</label>
              <select
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="input"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">工作地点</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="例如：北京"
              />
            </div>
            <div>
              <label className="label">薪资范围</label>
              <input
                type="text"
                value={formData.salaryRange || ''}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                className="input"
                placeholder="例如：30K-50K"
              />
            </div>
            <div>
              <label className="label">最低工作年限</label>
              <input
                type="number"
                value={formData.minWorkYears || 0}
                onChange={(e) => setFormData({ ...formData, minWorkYears: parseInt(e.target.value) })}
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="label">学历要求</label>
              <select
                value={formData.educationRequirement || ''}
                onChange={(e) => setFormData({ ...formData, educationRequirement: e.target.value })}
                className="input"
              >
                {EDUCATION_LEVELS.map((edu) => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">岗位描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input"
                placeholder="描述岗位的整体定位和核心价值..."
              />
            </div>
          </div>

          <div>
            <label className="label">岗位要求 *</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newRequirement.skill}
                onChange={(e) => setNewRequirement({ ...newRequirement, skill: e.target.value })}
                className="input flex-1"
                placeholder="技能名称，如 React"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <input
                type="number"
                value={newRequirement.minYears}
                onChange={(e) => setNewRequirement({ ...newRequirement, minYears: parseInt(e.target.value) })}
                className="input w-24"
                placeholder="年限"
              />
              <input
                type="number"
                value={newRequirement.weight}
                onChange={(e) => setNewRequirement({ ...newRequirement, weight: parseInt(e.target.value) })}
                className="input w-24"
                placeholder="权重"
                min={1}
                max={10}
              />
              <label className="flex items-center gap-2 px-3">
                <input
                  type="checkbox"
                  checked={newRequirement.required}
                  onChange={(e) => setNewRequirement({ ...newRequirement, required: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">必填</span>
              </label>
              <button onClick={addRequirement} className="btn-primary">
                添加
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
              {formData.requirements?.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      req.required ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {req.required ? '必填' : '加分'}
                    </span>
                    <span className="font-medium text-slate-700">{req.skill}</span>
                    <span className="text-sm text-slate-500">{req.minYears} 年以上</span>
                    <span className="text-xs text-slate-400">权重: {req.weight}</span>
                  </div>
                  <button
                    onClick={() => removeRequirement(idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">岗位职责</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                className="input flex-1"
                placeholder="描述一项岗位职责..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
              />
              <button onClick={addResponsibility} className="btn-primary">
                添加
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
              {formData.responsibilities?.map((resp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <span className="text-slate-700">{idx + 1}. {resp}</span>
                  <button
                    onClick={() => removeResponsibility(idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedJob(null);
        }}
        title="岗位详情"
        size="xl"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedJob.title}</h3>
              <p className="text-slate-500 mt-1">{selectedJob.department} · {selectedJob.industry}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">工作地点</p>
                <p className="font-semibold text-slate-900 mt-1">{selectedJob.location}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">薪资范围</p>
                <p className="font-semibold text-primary-600 mt-1">{selectedJob.salaryRange}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">经验要求</p>
                <p className="font-semibold text-slate-900 mt-1">{selectedJob.minWorkYears} 年以上</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">岗位描述</h4>
              <p className="text-slate-600">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">技能要求</h4>
              <div className="space-y-2">
                {selectedJob.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        req.required ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {req.required ? '必填' : '加分'}
                      </span>
                      <span className="font-medium text-slate-700">{req.skill}</span>
                      <span className="text-sm text-slate-500">{req.minYears} 年以上</span>
                    </div>
                    <span className="text-xs text-slate-400">权重: {req.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">岗位职责</h4>
              <div className="space-y-2">
                {selectedJob.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-primary-500 font-medium">{idx + 1}.</span>
                    <span className="text-slate-600">{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedJob(null);
        }}
        title="编辑岗位"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedJob(null);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleEdit} className="btn-primary">
              保存修改
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">岗位名称</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">所属部门</label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">行业</label>
              <select
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="input"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">工作地点</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">薪资范围</label>
              <input
                type="text"
                value={formData.salaryRange || ''}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">最低工作年限</label>
              <input
                type="number"
                value={formData.minWorkYears || 0}
                onChange={(e) => setFormData({ ...formData, minWorkYears: parseInt(e.target.value) })}
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="label">岗位描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
