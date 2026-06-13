import { useState, useEffect } from 'react';
import { 
  Users, Briefcase, AlertTriangle, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useStore } from '../store/useStore';
import { ScoreRing } from '../components/ScoreRing';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import type { Candidate, Job } from '../../shared/types';

export function MatchReport() {
  const { 
    candidates, 
    jobs, 
    selectedMatchReport, 
    matchReports,
    loading, 
    fetchCandidates, 
    fetchJobs,
    getMatchReport,
    batchCalculateMatch,
    addToast 
  } = useStore();

  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const handleSingleMatch = async () => {
    if (!selectedCandidateId || !selectedJobId) {
      addToast('warning', '请选择候选人和岗位');
      return;
    }
    await getMatchReport(selectedCandidateId, selectedJobId);
  };

  const handleBatchMatch = async () => {
    if (selectedCandidateIds.length === 0 || !selectedJobId) {
      addToast('warning', '请选择候选人和岗位');
      return;
    }
    await batchCalculateMatch(selectedCandidateIds, selectedJobId);
  };

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-danger-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-warning-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-danger-500';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-danger-100 text-danger-700';
      case 'medium': return 'bg-warning-100 text-warning-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high': return '高影响';
      case 'medium': return '中影响';
      default: return '低影响';
    }
  };

  const radarData = selectedMatchReport?.dimensions.map(d => ({
    dimension: d.name,
    score: d.score,
    fullMark: 100,
  })) || [];

  const barData = matchReports.map(r => {
    const candidate = candidates.find(c => c.id === r.candidateId);
    return {
      name: candidate?.name || '未知',
      score: r.overallScore,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">匹配报告</h1>
          <p className="text-slate-500 mt-1">分析候选人与岗位的匹配程度</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsBatchMode(false);
              setSelectedCandidateIds([]);
            }}
            className={`btn ${!isBatchMode ? 'btn-primary' : 'btn-secondary'}`}
          >
            单人匹配
          </button>
          <button
            onClick={() => {
              setIsBatchMode(true);
              setSelectedCandidateId('');
            }}
            className={`btn ${isBatchMode ? 'btn-primary' : 'btn-secondary'}`}
          >
            批量匹配
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              {isBatchMode ? '选择候选人（可多选）' : '选择候选人'}</label>
            {!isBatchMode ? (
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="input"
              >
                <option value="">请选择候选人</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.industry}
                  </option>
                ))}
              </select>
            ) : (
              <div className="border border-slate-300 rounded-lg max-h-60 overflow-y-auto scrollbar-thin">
              {candidates.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.includes(c.id)}
                    onChange={() => toggleCandidateSelection(c.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{c.industry}</span>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </label>
              ))}
            </div>
            )}
            {isBatchMode && (
              <p className="text-xs text-slate-500 mt-2">
                已选择 {selectedCandidateIds.length} 位候选人
              </p>
            )}
          </div>
          <div>
            <label className="label">选择岗位</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="input"
            >
              <option value="">请选择岗位</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} - {j.department}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={isBatchMode ? handleBatchMatch : handleSingleMatch}
            disabled={loading.match || loading.batchMatch}
            className="btn-primary"
          >
              {loading.match || loading.batchMatch ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  分析中...
                </>
              ) : (
                  <>开始{isBatchMode ? '批量匹配' : '开始匹配'}</>
                )}
            </button>
        </div>
      </div>

      {loading.match || loading.batchMatch ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : isBatchMode && matchReports.length > 0 ? (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">批量匹配结果</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 60 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {matchReports.map((report, idx) => {
              const candidate = candidates.find(c => c.id === report.candidateId);
              return (
                <div key={idx} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-ocean-500 rounded-full flex items-center justify-center text-white font-bold">
                      {candidate?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{candidate?.name}</h4>
                      <p className="text-xs text-slate-500">{candidate?.industry}</p>
                    </div>
                  </div>
                  <ScoreRing score={report.overallScore} size={60} strokeWidth={6} showLabel={false} />
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={candidate?.status || 'pending'} size="sm" />
                  <span className={`text-sm font-semibold ${getScoreColor(report.overallScore)}`}>
                    {report.overallScore} 分
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : !isBatchMode && selectedMatchReport ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">综合匹配度</h3>
              <div className="flex justify-center mb-4">
                <ScoreRing score={selectedMatchReport.overallScore} size={160} strokeWidth={14} />
              </div>
              <p className="text-slate-600 text-sm">
                {selectedMatchReport.summary}
              </p>
            </div>

            <div className="card p-6 col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">多维度分析</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="得分"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">缺失经历</h3>
              </div>
              {selectedMatchReport.missingItems.length === 0 ? (
                <p className="text-slate-500 text-sm">该候选人满足所有岗位要求</p>
              ) : (
                <div className="space-y-3">
                  {selectedMatchReport.missingItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getImpactColor(item.impact)}`}>
                          {getImpactLabel(item.impact)}
                        </span>
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-slate-900">面试追问点</h3>
              </div>
              {selectedMatchReport.interviewQuestions.length === 0 ? (
                <p className="text-slate-500 text-sm">暂无面试问题建议</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                  {selectedMatchReport.interviewQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">{q.question}</p>
                      <p className="text-xs text-slate-500">考察目的：{q.purpose}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">各维度得分详情</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedMatchReport.dimensions.map((dim, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{dim.name}</span>
                    <span className={`font-bold ${getScoreColor(dim.score)}`}>
                      {dim.score}分
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getScoreBg(dim.score)}`}
                      style={{ width: `${dim.score}%`}}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{dim.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="暂无匹配报告"
          description="选择候选人和岗位后点击开始匹配"
        />
      )}
    </div>
  );
}
