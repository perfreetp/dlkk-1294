import { NavLink, Outlet } from 'react-router-dom';
import { 
  Users, Briefcase, FileBarChart, MessageSquare, FileText, Stethoscope } from 'lucide-react';
import type { ReactNode } from 'react';

const navItems = [
  { to: '/candidates', icon: Users, label: '候选人列表' },
  { to: '/jobs', icon: Briefcase, label: '岗位库' },
  { to: '/match-report', icon: FileBarChart, label: '匹配报告' },
  { to: '/communications', icon: MessageSquare, label: '沟通记录' },
  { to: '/templates', icon: FileText, label: '模板管理' },
];

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-ocean-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">ResumeDoctor</h1>
              <p className="text-xs text-slate-500">智能简历诊断系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-gradient-to-br from-primary-50 to-ocean-50 rounded-xl p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">今日统计</p>
            <p className="text-2xl font-bold text-primary-700">15</p>
            <p className="text-xs text-slate-500">位候选人待处理</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
