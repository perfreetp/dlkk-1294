import { useState, useEffect } from 'react';
import { 
  Plus, Search, MoreHorizontal, Trash2, Edit, Eye, 
  FileText, Download, Building2, Calendar, Code, X 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { exportApi } from '../lib/api';
import type { Template } from '../../shared/types';

const DEFAULT_TEMPLATE_CONTENT = `# {{name}} 候选人推荐报告

## 基本信息

- **姓名**: {{name}}
- **电话**: {{phone}}
- **邮箱**: {{email}}
- **学历**: {{education}}
- **专业**: {{major}}
- **工作年限**: {{totalWorkYears}} 年
- **行业**: {{industry}}
- **当前薪资**: {{currentSalary}}
- **期望薪资**: {{expectedSalary}}

## 核心技能

{{#each skills}}
- {{this.name}} ({{this.years}} 年)
{{/each}}

## 工作经历

{{#each experiences}}
### {{this.position}} @ {{this.company}}
**时间**: {{this.startDate}} - {{this.endDate}}

{{this.description}}

{{/each}}

## 顾问推荐理由

{{recommendationReason}}

---
*本报告由 ResumeDoctor 智能简历诊断系统生成*
`;

export function Templates() {
  const { 
    templates, 
    candidates,
    loading, 
    fetchTemplates, 
    fetchCandidates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addToast 
  } = useStore();

  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'html'>('pdf');
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    content: DEFAULT_TEMPLATE_CONTENT,
    variables: [] as string[],
  });

  useEffect(() => {
    fetchTemplates({
      clientName: clientFilter || undefined,
      search: search || undefined,
    });
    fetchCandidates();
  }, [clientFilter, search]);

  const uniqueClients = [...new Set(templates.map(t => t.clientName))];

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      addToast('warning', '请输入模板名称');
      return;
    }
    if (!formData.clientName.trim()) {
      addToast('warning', '请输入客户名称');
      return;
    }
    if (!formData.content.trim()) {
      addToast('warning', '请输入模板内容');
      return;
    }
    
    await createTemplate(formData as Omit<Template, 'id' | 'createdAt' | 'updatedAt'>);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (selectedTemplate) {
      await updateTemplate(selectedTemplate.id, formData);
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      await deleteTemplate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clientName: '',
      content: DEFAULT_TEMPLATE_CONTENT,
      variables: [],
    });
  };

  const openEditModal = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      clientName: template.clientName,
      content: template.content,
      variables: template.variables,
    });
    setIsEditModalOpen(true);
  };

  const openPreviewModal = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedCandidateId('');
    setPreviewContent('');
    setIsPreviewModalOpen(true);
  };

  const openExportModal = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedCandidateId('');
    setIsExportModalOpen(true);
  };

  const handlePreview = async () => {
    if (!selectedTemplate || !selectedCandidateId) {
      addToast('warning', '请选择候选人');
      return;
    }
    
    try {
      const candidate = candidates.find(c => c.id === selectedCandidateId);
      if (!candidate) return;

      let content = selectedTemplate.content;
      
      content = content
        .replace(/{{name}}/g, candidate.name)
        .replace(/{{phone}}/g, candidate.phone)
        .replace(/{{email}}/g, candidate.email)
        .replace(/{{education}}/g, candidate.education)
        .replace(/{{major}}/g, candidate.major)
        .replace(/{{totalWorkYears}}/g, String(candidate.totalWorkYears))
        .replace(/{{industry}}/g, candidate.industry)
        .replace(/{{currentSalary}}/g, candidate.currentSalary)
        .replace(/{{expectedSalary}}/g, candidate.expectedSalary)
        .replace(/{{recommendationReason}}/g, candidate.recommendationReason || '暂无');

      const skillsSection = candidate.skills
        .map(skill => `- ${skill.name} (${skill.years} 年)`)
        .join('\n');
      content = content.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsSection);

      const experiencesSection = candidate.experiences
        .map(exp => `### ${exp.position} @ ${exp.company}\n**时间**: ${exp.startDate} - ${exp.endDate}\n\n${exp.description}\n`)
        .join('\n');
      content = content.replace(/{{#each experiences}}[\s\S]*?{{\/each}}/g, experiencesSection);

      setPreviewContent(content);
    } catch (error) {
      addToast('error', '预览失败');
    }
  };

  const handleExport = async () => {
    if (!selectedTemplate || !selectedCandidateId) {
      addToast('warning', '请选择候选人');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await exportApi.generateBriefing(
        selectedCandidateId,
        selectedTemplate.id,
        exportFormat
      );

      if (response.success && response.data) {
        addToast('success', '简报生成成功，正在下载...');
        setTimeout(() => {
          exportApi.downloadFile(response.data!.fileName);
        }, 500);
        setIsExportModalOpen(false);
      } else {
        addToast('error', response.error || '生成简报失败');
      }
    } catch (error) {
      addToast('error', '生成简报失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">模板管理</h1>
          <p className="text-slate-500 mt-1">管理客户推荐模板和导出候选人简报</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          新增模板
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">总模板数</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{templates.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">客户数量</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{uniqueClients.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">本月导出</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">0</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索模板名称、内容..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">全部客户</option>
            {uniqueClients.map((client) => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
      </div>

      {loading.templates ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="暂无模板"
          description="创建第一个推荐模板开始导出简报"
          action={{
            label: '创建模板',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="card p-5 hover:border-primary-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-ocean-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      <span>{template.clientName}</span>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => openPreviewModal(template)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-lg"
                    >
                      <Eye className="w-4 h-4" />
                      预览模板
                    </button>
                    <button
                      onClick={() => openExportModal(template)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      导出简报
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      编辑模板
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">模板变量</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.slice(0, 6).map((variable, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                  {template.variables.length > 6 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                      +{template.variables.length - 6}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(template.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span>{template.variables.length} 个变量</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openPreviewModal(template)}
                  className="btn-secondary flex-1 text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  预览
                </button>
                <button
                  onClick={() => openExportModal(template)}
                  className="btn-primary flex-1 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  导出
                </button>
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
        title="创建新模板"
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
              创建模板
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">模板名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="例如：技术岗通用推荐模板"
              />
            </div>
            <div>
              <label className="label">客户名称 *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="input"
                placeholder="例如：字节跳动"
              />
            </div>
          </div>
          <div>
            <label className="label">模板内容 *</label>
            <div className="mb-2 flex flex-wrap gap-1">
              <span className="text-xs text-slate-500">可用变量：</span>
              {['name', 'phone', 'email', 'education', 'major', 'totalWorkYears', 'industry', 'currentSalary', 'expectedSalary'].map((v) => (
                <code
                  key={v}
                  className="px-1.5 py-0.5 bg-slate-100 text-primary-600 text-xs rounded font-mono cursor-pointer hover:bg-primary-100"
                  onClick={() => {
                    const textarea = document.querySelector('textarea[name="templateContent"]') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newValue = formData.content.substring(0, start) + `{{${v}}}` + formData.content.substring(end);
                      setFormData({ ...formData, content: newValue });
                    }
                  }}
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
            <textarea
              name="templateContent"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="input font-mono text-sm"
              placeholder="使用 {{变量名}} 语法，例如 {{name}} 会被替换为候选人姓名"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTemplate(null);
        }}
        title="编辑模板"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedTemplate(null);
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">模板名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">客户名称</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">模板内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="input font-mono text-sm"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedTemplate(null);
          setPreviewContent('');
        }}
        title="预览模板"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="label">选择候选人</label>
            <div className="flex gap-2">
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="input flex-1"
              >
                <option value="">请选择候选人</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.industry}</option>
                ))}
              </select>
              <button
                onClick={handlePreview}
                className="btn-primary"
              >
                生成预览
              </button>
            </div>
          </div>
          
          {previewContent ? (
            <div className="border border-slate-200 rounded-lg p-6 bg-white max-h-96 overflow-y-auto scrollbar-thin">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">
                {previewContent}
              </pre>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">选择候选人后点击生成预览</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setSelectedTemplate(null);
        }}
        title="导出候选人简报"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsExportModalOpen(false);
                setSelectedTemplate(null);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={!selectedCandidateId || isGenerating}
              className="btn-primary"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  导出简报
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">当前模板</label>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-700">{selectedTemplate?.name}</p>
              <p className="text-sm text-slate-500">{selectedTemplate?.clientName}</p>
            </div>
          </div>
          <div>
            <label className="label">选择候选人 *</label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="input"
            >
              <option value="">请选择候选人</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.industry}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">导出格式</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('html')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'html'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Code className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">HTML</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
