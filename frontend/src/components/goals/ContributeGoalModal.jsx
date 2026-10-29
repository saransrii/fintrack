import React, { useState } from 'react';
import { X, PiggyBank, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export default function ContributeGoalModal({ isOpen, onClose, goal, onContributed }) {
  const { symbol } = useCurrency();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid contribution amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post(`/goals/${goal._id}/contribute`, {
        amount: Number(amount),
        note: note || 'Goal deposit'
      });
      onContributed && onContributed();
      onClose();
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-white/10 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">Add Contribution</h3>
              <p className="text-xs text-emerald-100">{goal.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl flex justify-between text-xs text-slate-600">
            <span>Target: <strong>{symbol}{goal.targetAmount?.toLocaleString()}</strong></span>
            <span>Saved: <strong>{symbol}{goal.currentAmount?.toLocaleString()}</strong></span>
            <span className="text-emerald-600 font-bold">{goal.percentage}%</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Contribution Amount ({symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium">
                {symbol}
              </span>
              <input
                type="number"
                required
                min="1"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly salary savings deposit"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Deposit Funds</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
