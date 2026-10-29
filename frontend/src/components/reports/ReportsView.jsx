import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export default function ReportsView({ selectedMonth, refreshTrigger }) {
  const { formatCurrency } = useCurrency();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/report/${selectedMonth || 'current'}`);
      setReport(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, refreshTrigger]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-40 bg-slate-200 rounded-3xl"></div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const metrics = report?.metrics || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    dailyAverageSpend: 0,
    adherenceScore: 75
  };

  const topCategories = report?.topCategories || [];
  const categoryBreakdown = report?.categoryBreakdown || [];
  const transactions = report?.transactions || [];

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Monthly Financial Statement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade financial health summary for period: {selectedMonth}
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 print:shadow-none print:border-none print:p-0 space-y-8">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                FinTrack Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">Statement Period: {selectedMonth}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Budget Adherence Score
            </span>
            <div className="flex items-center justify-end space-x-2 mt-1">
              <span className="text-3xl font-black text-emerald-600">
                {metrics.adherenceScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 mt-1">
              {metrics.adherenceScore >= 80 ? 'Excellent Control' : metrics.adherenceScore >= 60 ? 'Moderate Health' : 'Needs Optimization'}
            </span>
          </div>
        </div>

        {/* 4 Key Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Inflow
            </span>
            <p className="text-lg font-black text-emerald-600 mt-0.5">
              {formatCurrency(metrics.totalIncome)}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Outflow
            </span>
            <p className="text-lg font-black text-rose-600 mt-0.5">
              {formatCurrency(metrics.totalExpense)}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Net Surplus Saved
            </span>
            <p className="text-lg font-black text-blue-600 mt-0.5">
              {formatCurrency(metrics.netSavings)}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Savings Rate
            </span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {metrics.savingsRate}%
            </p>
          </div>
        </div>

        {/* Top 3 Drivers */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Primary Outflow Drivers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCategories.map((c, i) => (
              <div key={c.category} className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  #{i + 1} Outflow
                </span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{c.category}</p>
                <p className="text-base font-black text-slate-900 mt-1">
                  {formatCurrency(c.amount)}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {c.percentage}% of total expenses
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Category-Wise Breakdown Table
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Category</th>
                  <th className="py-2.5 px-4 font-bold text-right">Total Spent</th>
                  <th className="py-2.5 px-4 font-bold text-right">Share of Expense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryBreakdown.map((item) => (
                  <tr key={item.category}>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{item.category}</td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500 font-semibold">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Transactions Summary */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Itemized Statement Entries ({transactions.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Date</th>
                  <th className="py-2.5 px-4 font-bold">Title</th>
                  <th className="py-2.5 px-4 font-bold">Category</th>
                  <th className="py-2.5 px-4 font-bold">Method</th>
                  <th className="py-2.5 px-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4 text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-800">{tx.title}</td>
                    <td className="py-2 px-4 text-slate-600">{tx.category}</td>
                    <td className="py-2 px-4 text-slate-500">{tx.paymentMethod}</td>
                    <td
                      className={`py-2 px-4 text-right font-black ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
