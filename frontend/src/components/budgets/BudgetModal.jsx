import React, { useState, useEffect } from 'react';
import { X, Sliders, Check, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Rent & Housing',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Health & Fitness',
  'Shopping',
  'Education',
  'Personal Care'
];

export default function BudgetModal({ isOpen, onClose, currentMonth, onSaved, existingBudget }) {
  const { symbol } = useCurrency();
  const [totalBudget, setTotalBudget] = useState(50000);
  const [alertThreshold, setAlertThreshold] = useState(85);
  const [categoryBudgets, setCategoryBudgets] = useState(
    DEFAULT_CATEGORIES.map((c) => ({ category: c, limit: 5000 }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingBudget && existingBudget.exists) {
      setTotalBudget(existingBudget.totalBudget || 50000);
      setAlertThreshold(existingBudget.alertThreshold || 85);
      if (existingBudget.categories && existingBudget.categories.length > 0) {
        setCategoryBudgets(
          existingBudget.categories.map((c) => ({ category: c.category, limit: c.limit }))
        );
      }
    }
  }, [existingBudget, isOpen]);

  if (!isOpen) return null;

  const handleCategoryLimitChange = (catName, val) => {
    const num = Number(val) || 0;
    setCategoryBudgets((prev) =>
      prev.map((c) => (c.category === catName ? { ...c, limit: num } : c))
    );
  };

  const totalAllocated = categoryBudgets.reduce((sum, c) => sum + (Number(c.limit) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/budgets', {
        month: currentMonth,
        totalBudget: Number(totalBudget),
        categoryBudgets,
        alertThreshold: Number(alertThreshold)
      });
      onSaved && onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-white/10 rounded-xl">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">Configure Monthly Budget</h3>
              <p className="text-xs text-emerald-100">Planning period: {currentMonth}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Overall Monthly Budget */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Overall Total Budget Cap ({symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Warning Alert Threshold ({alertThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-3"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Triggers warning notification at {alertThreshold}% spent
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between text-xs text-slate-600">
              <span>Category sum: <strong>{symbol}{totalAllocated.toLocaleString()}</strong></span>
              <span className={totalAllocated > totalBudget ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {totalAllocated > totalBudget ? '⚠️ Exceeds total budget cap' : '✅ Within total limit'}
              </span>
            </div>
          </div>

          {/* Category Budgets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Category-Wise Spending Limits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryBudgets.map((cb) => (
                <div key={cb.category} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 truncate">
                    {cb.category}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={cb.limit}
                      onChange={(e) => handleCategoryLimitChange(cb.category, e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Budget Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
