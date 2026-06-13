import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, MessageSquare, 
  Phone, Mail, Calendar, User, Clock, ChevronDown 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';

const COMMUNICATION_TYPES = [
  { value: 'note', label: '备注', icon: MessageSquare },
  { value: 'call', label: '电话', icon: Phone },
  { value: 'email', label: '邮件', icon: Mail },
  { value: 'interview', label: '面试', icon: Calendar },
];

export function Communications() {
  const { 
    communications, 
    candidates,
    loading, 
    fetchCommunications, 
    fetchCandidates,
    createCommunication,
    deleteCommunication,
    addToast 
  } = useStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [candidateFilter, setCandidateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidateId: '',
    type: 'note' as const,
    content: '',
    createdBy: '顾问',
  });

  useEffect(() => {
    fetchCommunications({
      type: typeFilter || undefined,
      candidateId: candidateFilter || undefined,
    });
    fetchCandidates();
  }, [typeFilter, candidateFilter]);

  const filteredCommunications = communications.filter(comm => {
    if (!search) return true;
    const candidate = candidates.find(c => c.id === comm.candidateId);
    const searchLower = search.toLowerCase();
    return (
      comm.content.toLowerCase().includes(searchLower) ||
      candidate?.name.toLowerCase().includes(searchLower) ||
      candidate?.email.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = async () => {
    if (!formData.candidateId) {
      addToast('warning', '请选择候选人');
      return;
    }
    if (!formData.content.trim()) {
      addToast('warning', '请输入沟通内容');
      return;
    }
    
    await createCommunication(formData);
    setIsCreateModalOpen(false);
    setFormData({
      candidateId: '',
      type: 'note',
      content: '',
      createdBy: '顾问',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条沟通记录吗？')) {
      await deleteCommunication(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeInfo = (type: string) => {
    return COMMUNICATION_TYPES.find(t => t.value === type) || COMMUNICATION_TYPES[0];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-emerald-100 text-emerald-700';
      case 'email': return 'bg-blue-100 text-blue-700';
      case 'interview': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const stats = {
    total: communications.length,
    calls: communications.filter(c => c.type === 'call').length,
    emails: communications.filter(c => c.type === 'email').length,
    interviews: communications.filter(c => c.type === 'interview').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">沟通记录</h1>
          <p className="text-slate-500 mt-1">管理与候选人的所有沟通历史</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          新增记录
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">总记录数</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">电话沟通</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.calls}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">邮件往来</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.emails}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">面试安排</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{stats.interviews}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索沟通内容、候选人姓名..."
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
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <label className="label">沟通类型</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input"
              >
                <option value="">全部类型</option>
                {COMMUNICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">候选人</label>
              <select
                value={candidateFilter}
                onChange={(e) => setCandidateFilter(e.target.value)}
                className="input"
              >
                <option value="">全部候选人</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading.communications ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCommunications.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="暂无沟通记录"
          description="添加第一条沟通记录开始跟踪候选人"
          action={{
            label: '新增记录',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredCommunications.map((comm) => {
            const candidate = candidates.find(c => c.id === comm.candidateId);
            const typeInfo = getTypeInfo(comm.type);
            const TypeIcon = typeInfo.icon;

            return (
              <div key={comm.id} className="card p-5 hover:border-primary-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(comm.type)}`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {candidate && (
                          <>
                            <span className="font-semibold text-slate-900">{candidate.name}</span>
                            <StatusBadge status={candidate.status} size="sm" />
                          </>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(comm.type)}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(comm.createdAt)}
                        </span>
                        <button
                          onClick={() => handleDelete(comm.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">
                      {comm.content}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <User className="w-3 h-3" />
                      <span>记录人：{comm.createdBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({
            candidateId: '',
            type: 'note',
            content: '',
            createdBy: '顾问',
          });
        }}
        title="新增沟通记录"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({
                  candidateId: '',
                  type: 'note',
                  content: '',
                  createdBy: '顾问',
                });
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleCreate} className="btn-primary">
              保存记录
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">选择候选人 *</label>
            <select
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              className="input"
            >
              <option value="">请选择候选人</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.industry}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">沟通类型</label>
            <div className="grid grid-cols-4 gap-2">
              {COMMUNICATION_TYPES.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <TypeIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="label">记录人</label>
            <input
              type="text"
              value={formData.createdBy}
              onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
              className="input"
            />
          </div>
          
          <div>
            <label className="label">沟通内容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="input"
              placeholder="记录沟通内容、候选人反馈、下一步计划等..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
