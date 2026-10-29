import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  BarChart3,
  FileSpreadsheet,
  BrainCircuit,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ReceiptText,
      badge: null
    },
    {
      id: 'budgets',
      label: 'Budget Planning',
      icon: PieChart,
      badge: null
    },
    {
      id: 'goals',
      label: 'Savings Goals',
      icon: Target,
      badge: null
    },
    {
      id: 'charts',
      label: 'Interactive Charts',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'reports',
      label: 'Monthly Reports',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'ai-insights',
      label: 'AI Spending Insights',
      icon: BrainCircuit,
      badge: 'Special'
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
          Financial Management
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Assistant Banner at bottom of sidebar */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl">
        <div className="flex items-center space-x-2 mb-1.5">
          <div className="p-1 bg-indigo-600 text-white rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-indigo-950">
            Intelligent Advisor
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          AI continuously analyzes your past patterns to offer personalized savings tips.
        </p>
        <button
          onClick={() => setActiveTab('ai-insights')}
          className="mt-2.5 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl transition shadow-sm"
        >
          View Savings Suggestions
        </button>
      </div>
    </aside>
  );
}
