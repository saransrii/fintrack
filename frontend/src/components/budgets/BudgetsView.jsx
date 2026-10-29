import React, { useState, useEffect } from 'react';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export default function BudgetsView({ selectedMonth, onOpenBudgetModal, refreshTrigger }) {
  const { formatCurrency } = useCurrency();
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets/month/${selectedMonth || 'current'}`);
      setBudgetData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const hasBudget = budgetData && budgetData.exists;
  const categories = budgetData?.categories || [];
  const alerts = budgetData?.alerts || [];
  const totalBudget = budgetData?.totalBudget || 0;
  const totalSpent = budgetData?.totalSpent || 0;
  const remaining = budgetData?.remainingBudget ?? (totalBudget - totalSpent);
  const totalPct = budgetData?.totalPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Overall Budget Gauge */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <PieChart className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Monthly Spending Blueprint
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Budget Planning: {selectedMonth}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track category limits against live transactions to prevent overspending before month-end.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenBudgetModal && onOpenBudgetModal(budgetData)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>{hasBudget ? 'Edit Monthly Budget' : 'Setup Budget Plan'}</span>
            </button>
          </div>
        </div>

        {/* Overall Status Bar */}
        {hasBudget ? (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Monthly Budget Cap
                </span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Spending
                </span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Remaining Spending Cushion
                </span>
                <p
                  className={`text-xl font-black mt-0.5 ${
                    remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalPct > 100
                    ? 'bg-rose-500'
                    : totalPct > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, totalPct)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold mt-2 text-slate-500">
              <span>{totalPct}% consumed</span>
              <span>{Math.max(0, 100 - totalPct)}% remaining</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-6 bg-slate-50 rounded-2xl text-center">
            <p className="text-sm font-semibold text-slate-600">
              No budget set for {selectedMonth} yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Setup Budget Plan" to allocate category limits and enable spending alerts.
            </p>
          </div>
        )}
      </div>

      {/* Overspending Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Active Spending Alerts ({alerts.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  alert.type === 'danger'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    alert.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">{alert.category}</h4>
                  <p className="text-xs mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category-Wise Budgets Grid */}
      {hasBudget && categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Category Spending Limits & Utilization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const isOver = cat.isExceeded;
              const isWarning = cat.isNearLimit;

              return (
                <div
                  key={cat.category}
                  className={`p-5 rounded-2xl bg-white border transition shadow-sm ${
                    isOver
                      ? 'border-rose-300 ring-2 ring-rose-100'
                      : isWarning
                      ? 'border-amber-300'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {cat.category}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isOver
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {cat.percentage}%
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs mb-3">
                    <span className="font-black text-slate-900 text-base">
                      {formatCurrency(cat.spent)}
                    </span>
                    <span className="text-slate-400 font-semibold">
                      limit: {formatCurrency(cat.limit)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-bold mt-2.5">
                    <span className={isOver ? 'text-rose-600' : 'text-slate-500'}>
                      {isOver
                        ? `Over by ${formatCurrency(Math.abs(cat.remaining))}`
                        : `${formatCurrency(cat.remaining)} remaining`}
                    </span>
                    {isOver && (
                      <span className="text-rose-600 flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Exceeded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
