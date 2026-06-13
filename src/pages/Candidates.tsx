import { useState, useEffect, useRef } from 'react';
import { 
  Upload, Search, Filter, MoreHorizontal, Trash2, 
  FileText, Mail, Phone, Building2, GraduationCap, 
  Clock, DollarSign, ChevronDown, Edit, Eye, X 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { INDUSTRIES, STATUS_LABELS, EDUCATION_LEVELS } from '../../shared/types';
import type { Candidate, CandidateStatus } from '../../shared/types';

export function Candidates() {
  const { 
    candidates, 
    selectedCandidate,
    loading, 
    fetchCandidates, 
    uploadResumes, 
    updateCandidateStatus,
    deleteCandidate,
    addCandidateNote,
    updateCandidate,
    setSelectedCandidate,
    addToast 
  } = useStore();

  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editForm, setEditForm] = useState<Partial<Candidate>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCandidates({
      industry: industryFilter || undefined,
      status: statusFilter as CandidateStatus || undefined,
      search: search || undefined,
    });
  }, [industryFilter, statusFilter, search]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      addToast('warning', '请先选择简历文件');
      return;
    }
    const result = await uploadResumes(selectedFiles);
    if (result) {
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStatusChange = async (id: string, status: CandidateStatus) => {
    await updateCandidateStatus(id, status);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这位候选人吗？')) {
      await deleteCandidate(id);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      addToast('warning', '请输入备注内容');
      return;
    }
    if (selectedCandidate) {
      await addCandidateNote(selectedCandidate.id, noteText);
      setNoteText('');
      setIsNoteModalOpen(false);
    }
  };

  const openDetailModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setEditForm(candidate);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (selectedCandidate) {
      await updateCandidate(selectedCandidate.id, editForm);
      setIsEditModalOpen(false);
    }
  };

  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    recommended: candidates.filter(c => c.status === 'recommended').length,
    interview: candidates.filter(c => c.status === 'interview').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">候选人列表</h1>
          <p className="text-slate-500 mt-1">管理和筛选所有候选人简历</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary gap-2"
        >
          <Upload className="w-4 h-4" />
          批量上传简历
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">总候选人</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">待评估</p>
          <p className="text-3xl font-bold text-slate-600 mt-1">{stats.pending}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">已推荐</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{stats.recommended}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">面试中</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.interview}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索候选人姓名、技能、公司..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-2 ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
          >
            <Filter className="w-4 h-4" />
            筛选
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <label className="label">行业</label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="input"
              >
                <option value="">全部行业</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">状态</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">全部状态</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setIndustryFilter('');
                  setStatusFilter('');
                  setSearch('');
                }}
                className="btn-secondary flex-1"
              >
                重置筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {loading.candidates ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          title="暂无候选人"
          description="上传简历或手动添加候选人开始评估"
          action={{
            label: '上传简历',
            onClick: () => setIsUploadModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="card p-5 hover:border-primary-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-ocean-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{candidate.name}</h3>
                    <StatusBadge status={candidate.status} size="sm" />
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => openDetailModal(candidate)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-lg"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                    <button
                      onClick={() => openEditModal(candidate)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      编辑信息
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsNoteModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      添加备注
                    </button>
                    <button
                      onClick={() => handleDelete(candidate.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{candidate.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>{candidate.education} · {candidate.major}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{candidate.totalWorkYears} 年工作经验</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span>期望 {candidate.expectedSalary}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {candidate.skills.length > 5 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                      +{candidate.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="label">更新状态</label>
                <select
                  value={candidate.status}
                  onChange={(e) => handleStatusChange(candidate.id, e.target.value as CandidateStatus)}
                  className="input text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFiles([]);
        }}
        title="批量上传简历"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFiles([]);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || loading.upload}
              className="btn-primary"
            >
              {loading.upload ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  上传中...
                </>
              ) : (
                `上传 ${selectedFiles.length} 份简历`
              )}
            </button>
          </div>
        }
      >
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-300 hover:border-primary-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-primary-500' : 'text-slate-400'}`} />
          <p className="text-slate-700 font-medium mb-1">
            拖拽文件到这里，或
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-600 hover:text-primary-700 ml-1"
            >
              点击选择
            </button>
          </p>
          <p className="text-sm text-slate-500">
            支持 PDF、DOC、DOCX、TXT 格式，最多上传 20 个文件
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 mb-3">
              已选择 {selectedFiles.length} 个文件
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCandidate(null);
        }}
        title="候选人详情"
        size="xl"
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-ocean-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {selectedCandidate.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.name}</h3>
                  <StatusBadge status={selectedCandidate.status} />
                </div>
                <p className="text-slate-500 mt-1">
                  {selectedCandidate.education} · {selectedCandidate.major} · {selectedCandidate.totalWorkYears} 年经验
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedCandidate.industry}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">毕业于 {selectedCandidate.graduationYear} 年</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">当前 {selectedCandidate.currentSalary} / 期望 {selectedCandidate.expectedSalary}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">核心技能</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg"
                  >
                    {skill.name} · {skill.years} 年
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">工作经历</h4>
              <div className="space-y-4">
                {selectedCandidate.experiences.map((exp, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-primary-200">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-slate-900">{exp.position}</h5>
                      <span className="text-sm text-slate-500">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <p className="text-primary-600 text-sm">{exp.company}</p>
                    <p className="text-slate-600 text-sm mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedCandidate.consultantNotes && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">顾问备注</h4>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-900 text-sm whitespace-pre-wrap">
                    {selectedCandidate.consultantNotes}
                  </p>
                </div>
              </div>
            )}

            {selectedCandidate.recommendationReason && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">推荐理由</h4>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-900 text-sm whitespace-pre-wrap">
                    {selectedCandidate.recommendationReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑候选人信息"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleEditSubmit} className="btn-primary">
              保存
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">姓名</label>
            <input
              type="text"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">电话</label>
            <input
              type="text"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">邮箱</label>
            <input
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">行业</label>
            <select
              value={editForm.industry || ''}
              onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              className="input"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">学历</label>
            <select
              value={editForm.education || ''}
              onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
              className="input"
            >
              {EDUCATION_LEVELS.map((edu) => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">工作年限</label>
            <input
              type="number"
              value={editForm.totalWorkYears || 0}
              onChange={(e) => setEditForm({ ...editForm, totalWorkYears: parseInt(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label className="label">当前薪资</label>
            <input
              type="text"
              value={editForm.currentSalary || ''}
              onChange={(e) => setEditForm({ ...editForm, currentSalary: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">期望薪资</label>
            <input
              type="text"
              value={editForm.expectedSalary || ''}
              onChange={(e) => setEditForm({ ...editForm, expectedSalary: e.target.value })}
              className="input"
            />
          </div>
          <div className="col-span-2">
            <label className="label">推荐理由</label>
            <textarea
              value={editForm.recommendationReason || ''}
              onChange={(e) => setEditForm({ ...editForm, recommendationReason: e.target.value })}
              rows={3}
              className="input"
              placeholder="填写推荐该候选人的理由..."
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setNoteText('');
        }}
        title="添加顾问备注"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsNoteModalOpen(false);
                setNoteText('');
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddNote} className="btn-primary">
              保存备注
            </button>
          </div>
        }
      >
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={5}
          className="input"
          placeholder="记录候选人特点、沟通情况、面试反馈等..."
        />
      </Modal>
    </div>
  );
}
