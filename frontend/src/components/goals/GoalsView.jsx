import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  PiggyBank,
  Calendar,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export default function GoalsView({ onOpenAddGoal, onOpenContribute, refreshTrigger }) {
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this savings goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchGoals();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalTargetAcrossGoals = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const overallPercentage = totalTargetAcrossGoals > 0 ? Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 rounded-3xl p-6 lg:p-8 text-white border border-purple-800/50 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
            Wealth Accumulation Tracker
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-3 tracking-tight">
            Savings Goals Portfolio
          </h2>
          <p className="text-xs text-purple-200 mt-2 max-w-xl leading-relaxed">
            Organize long-term dreams into dedicated buckets. Track milestone velocity and auto-calculate needed monthly deposits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-purple-200 font-bold block">
              Total Goals Capital
            </span>
            <span className="text-2xl font-black text-white">
              {formatCurrency(totalSavedAcrossGoals)}
            </span>
            <span className="text-xs text-purple-300 block">
              of {formatCurrency(totalTargetAcrossGoals)} ({overallPercentage}%)
            </span>
          </div>
          <button
            onClick={onOpenAddGoal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-xs text-white rounded-xl shadow-lg transition active:scale-95 flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active savings goals</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create an Emergency Fund, Tech Upgrade, or Vacation bucket to start tracking your milestone progress!
          </p>
          <button
            onClick={onOpenAddGoal}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const isCompleted = goal.isCompleted || goal.percentage >= 100;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal._id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span
                      className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: goal.color || '#10B981' }}
                    >
                      {goal.category}
                    </span>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {goal.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      target: {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, goal.percentage)}%`,
                        backgroundColor: goal.color || '#10B981'
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">{goal.percentage}% saved</span>
                    <span className={isCompleted ? 'text-emerald-600' : 'text-slate-500'}>
                      {isCompleted ? '🎉 Goal Achieved!' : `${formatCurrency(remaining)} to go`}
                    </span>
                  </div>
                </div>

                {/* Timeline & Recommended Monthly Deposit */}
                <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-2 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> Target Date:
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(goal.targetDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {!isCompleted && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Monthly Needed:
                      </span>
                      <span className="font-extrabold text-indigo-600">
                        {formatCurrency(goal.recommendedMonthlyDeposit)} / mo
                      </span>
                    </div>
                  )}

                  {goal.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200">
                      "{goal.notes}"
                    </p>
                  )}
                </div>

                {/* Action CTA */}
                <div>
                  <button
                    onClick={() => onOpenContribute && onOpenContribute(goal)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-400" />
                    <span>+ Contribute Funds</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
