import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Plus,
  Sparkles,
  ChevronRight,
  Target,
  Clock
} from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export default function DashboardView({
  selectedMonth,
  onOpenAddTx,
  setActiveTab,
  onOpenContribute
}) {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    incomeChangePct: 0,
    expenseChangePct: 0
  };

  const budget = data?.budget;
  const goals = data?.goals || [];
  const recentTransactions = data?.recentTransactions || [];
  const categoryExpenses = data?.categoryExpenses || {};

  const topCategories = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
            Intelligent Expense Analytics
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-3 tracking-tight">
            Financial Health Overview
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            FinTrack uses previous spending patterns to pinpoint hidden savings opportunities and accelerate your personal goals.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('ai-insights')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore AI Savings Suggestions</span>
            </button>
            <button
              onClick={onOpenAddTx}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 font-bold text-xs rounded-xl border border-white/15 flex items-center space-x-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(summary.totalIncome)}
            </p>
            <div className="flex items-center space-x-1 mt-1 text-xs">
              <span className={`font-semibold flex items-center ${summary.incomeChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {summary.incomeChangePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(summary.incomeChangePct)}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(summary.totalExpense)}
            </p>
            <div className="flex items-center space-x-1 mt-1 text-xs">
              <span className={`font-semibold flex items-center ${summary.expenseChangePct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {summary.expenseChangePct > 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(summary.expenseChangePct)}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Net Savings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-black tracking-tight ${summary.netSavings >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatCurrency(summary.netSavings)}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Surplus cash retained this month
            </p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Savings Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {summary.savingsRate}%
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.savingsRate >= 20 ? 'bg-emerald-500' : summary.savingsRate > 0 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Budget Overview & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Monthly Budget Cap</h3>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {budget ? (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-900">
                    {formatCurrency(budget.spent)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    of {formatCurrency(budget.totalBudget)} limit
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budget.percentage > 100
                        ? 'bg-rose-500'
                        : budget.percentage > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs font-bold">
                  <span className={budget.percentage > 100 ? 'text-rose-600' : 'text-slate-600'}>
                    {budget.percentage}% utilized
                  </span>
                  <span className={budget.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {budget.remaining >= 0
                      ? `${formatCurrency(budget.remaining)} left`
                      : `Exceeded by ${formatCurrency(Math.abs(budget.remaining))}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-6 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">No budget configured yet</p>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  + Setup Monthly Budget
                </button>
              </div>
            )}
          </div>

          {/* Top Spending Categories */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Top Categories This Month
            </h4>
            <div className="space-y-2">
              {topCategories.map(([cat, amt]) => {
                const pct = summary.totalExpense > 0 ? Math.round((amt / summary.totalExpense) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(amt)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Savings Goals Preview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Active Savings Goals</h3>
                <p className="text-xs text-slate-400">Tracking milestones & planned deposits</p>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All Goals <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {goals.map((g) => {
                const target = g.targetAmount || 1;
                const current = g.currentAmount || 0;
                const pct = Math.min(100, Math.round((current / target) * 100));

                return (
                  <div
                    key={g._id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: g.color || '#10B981' }}
                      ></span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {g.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate">{g.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatCurrency(current)} / {formatCurrency(target)}
                      </p>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: g.color || '#10B981'
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                      <span className="text-slate-700">{pct}%</span>
                      <button
                        onClick={() => onOpenContribute && onOpenContribute(g)}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        + Deposit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Banner Shortcut */}
          <div className="mt-5 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  AI detected ₹4,800 in potential monthly trims
                </p>
                <p className="text-[11px] text-slate-500">
                  Based on dining and recurring subscription patterns from last month.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest income and expense entries</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-bold">Title</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Payment Method</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-800">{tx.title}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{tx.paymentMethod}</td>
                  <td className="py-3 text-slate-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className={`py-3 text-right font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
