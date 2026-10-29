import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import TransactionsView from './components/transactions/TransactionsView';
import BudgetsView from './components/budgets/BudgetsView';
import GoalsView from './components/goals/GoalsView';
import AnalyticsView from './components/analytics/AnalyticsView';
import ReportsView from './components/reports/ReportsView';
import AIInsightsView from './components/ai-insights/AIInsightsView';

// Modals
import AddTransactionModal from './components/transactions/AddTransactionModal';
import BudgetModal from './components/budgets/BudgetModal';
import AddGoalModal from './components/goals/AddGoalModal';
import ContributeGoalModal from './components/goals/ContributeGoalModal';
import AuthModal from './components/auth/AuthModal';

import { useAuth } from './context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loginGuest, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Month state (defaults to current month YYYY-MM)
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Modal states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetModalData, setBudgetModalData] = useState(null);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setIsAddTxOpen(true);
  };

  const handleOpenBudgetModal = (existingData) => {
    setBudgetModalData(existingData);
    setIsBudgetModalOpen(true);
  };

  const handleOpenContribute = (goal) => {
    setContributeGoal(goal);
    setIsContributeOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20 animate-bounce">
            💰
          </div>
          <p className="text-xs font-bold text-slate-500">Loading FinTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navbar */}
      <Navbar
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenAddTx={() => {
          setEditingTx(null);
          setIsAddTxOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onRefreshData={triggerRefresh}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        {isAuthenticated && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {!isAuthenticated ? (
            /* Unauthenticated Landing Hero */
            <div className="max-w-4xl mx-auto py-12 text-center space-y-8 animate-in fade-in duration-300">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen Personal Finance Intelligence</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                FinTrack – Intelligent Expense Analytics Platform
              </h1>

              <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Take command of your financial future. Manage income & expenses, plan monthly budgets with alerts, track savings goals, and unlock AI-driven savings suggestions based on your past spending patterns.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={loginGuest}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 active:scale-95 transition flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Launch Instant Demo (Pre-loaded Data)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold rounded-2xl shadow-sm transition"
                >
                  Sign In / Create Account
                </button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl inline-block text-xl">
                    📊
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Interactive Budgeting
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set category-specific limits, monitor real-time consumption gauges, and receive alerts before you overspend.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl inline-block text-xl">
                    🧠
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Pattern-Based Savings Suggestions
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    AI analyzes your previous months' transaction velocity and recurring expenses to deliver quantified savings trims.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl inline-block text-xl">
                    🎯
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Savings Goal Acceleration
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Interactive "What-If" simulator maps every cut back directly to shorter timelines for your dream goals.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Authenticated Views */
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  selectedMonth={selectedMonth}
                  onOpenAddTx={() => {
                    setEditingTx(null);
                    setIsAddTxOpen(true);
                  }}
                  setActiveTab={setActiveTab}
                  onOpenContribute={handleOpenContribute}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  onOpenAddTx={() => {
                    setEditingTx(null);
                    setIsAddTxOpen(true);
                  }}
                  onEditTx={handleOpenEditTx}
                  refreshTrigger={refreshTrigger}
                />
              )}

              {activeTab === 'budgets' && (
                <BudgetsView
                  selectedMonth={selectedMonth}
                  onOpenBudgetModal={handleOpenBudgetModal}
                  refreshTrigger={refreshTrigger}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsView
                  onOpenAddGoal={() => setIsAddGoalOpen(true)}
                  onOpenContribute={handleOpenContribute}
                  refreshTrigger={refreshTrigger}
                />
              )}

              {activeTab === 'charts' && (
                <AnalyticsView refreshTrigger={refreshTrigger} />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  selectedMonth={selectedMonth}
                  refreshTrigger={refreshTrigger}
                />
              )}

              {activeTab === 'ai-insights' && (
                <AIInsightsView refreshTrigger={refreshTrigger} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onCreated={triggerRefresh}
        initialData={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={selectedMonth}
        existingBudget={budgetModalData}
        onSaved={triggerRefresh}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onCreated={triggerRefresh}
      />

      <ContributeGoalModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        goal={contributeGoal}
        onContributed={triggerRefresh}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
