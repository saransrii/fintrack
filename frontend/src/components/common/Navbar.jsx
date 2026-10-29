import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Sparkles,
  Database,
  LogOut,
  LogIn,
  Calendar,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function Navbar({
  selectedMonth,
  setSelectedMonth,
  onOpenAddTx,
  onOpenAuth,
  onRefreshData
}) {
  const { user, logout, triggerSeed, isAuthenticated } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Generate last 6 months options
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthOptions.push({ val, label });
  }

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await triggerSeed();
      setSeedSuccess(true);
      onRefreshData && onRefreshData();
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xl">
            💰
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                FinTrack
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Intelligent Expense & Savings Analytics
            </p>
          </div>
        </div>

        {/* Center: Month Selector */}
        <div className="hidden md:flex items-center bg-slate-100/90 rounded-2xl p-1 border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500 ml-2.5 mr-1.5" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 py-1.5 pr-6 pl-1 focus:outline-none cursor-pointer"
          >
            {monthOptions.map((m) => (
              <option key={m.val} value={m.val}>
                {m.label} {m.val === monthOptions[0].val ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => changeCurrency(e.target.value)}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-2.5 rounded-xl border border-slate-200 focus:outline-none transition cursor-pointer"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>

          {/* Seed Sample Data Button */}
          {isAuthenticated && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              title="Re-populate 3 months of realistic spending demo data"
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
                seedSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {seedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data Seeded!</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span>{seeding ? 'Seeding...' : 'Load Demo Data'}</span>
                </>
              )}
            </button>
          )}

          {/* Add Transaction Button */}
          {isAuthenticated && (
            <button
              onClick={onOpenAddTx}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          )}

          {/* User Auth Info / Button */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-1">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {user?.isGuest ? 'Demo' : 'Pro'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
