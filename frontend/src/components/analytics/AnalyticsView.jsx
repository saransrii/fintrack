import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, CreditCard } from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsView({ refreshTrigger }) {
  const { symbol, formatCurrency } = useCurrency();
  const [range, setRange] = useState('6');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/charts', { params: { range } });
      setChartData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, [range, refreshTrigger]);

  if (loading || !chartData) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-20 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { monthlyTrends = [], categoryDistribution = {}, paymentDistribution = {} } = chartData;

  // 1. Income vs Expense Bar Chart
  const incomeExpenseData = {
    labels: monthlyTrends.map((m) => m.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.map((m) => m.income),
        backgroundColor: '#10B981',
        borderRadius: 8
      },
      {
        label: 'Expenses',
        data: monthlyTrends.map((m) => m.expense),
        backgroundColor: '#F43F5E',
        borderRadius: 8
      }
    ]
  };

  // 2. Net Savings Trend Line Chart
  const savingsTrendData = {
    labels: monthlyTrends.map((m) => m.label),
    datasets: [
      {
        label: 'Net Savings',
        data: monthlyTrends.map((m) => m.savings),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointRadius: 5
      }
    ]
  };

  // 3. Category Doughnut Chart
  const catLabels = Object.keys(categoryDistribution);
  const catValues = Object.values(categoryDistribution);
  const catColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#64748B',
    '#14B8A6', '#F97316', '#6366F1'
  ];

  const categoryDoughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catValues,
        backgroundColor: catColors.slice(0, catLabels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 4. Payment Method Doughnut Chart
  const pmLabels = Object.keys(paymentDistribution);
  const pmValues = Object.values(paymentDistribution);
  const pmColors = ['#0284C7', '#6366F1', '#10B981', '#F59E0B', '#EC4899'];

  const paymentChartData = {
    labels: pmLabels,
    datasets: [
      {
        data: pmValues,
        backgroundColor: pmColors.slice(0, pmLabels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header with Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Interactive Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize income vs expenses, category distributions, and cash velocity
          </p>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          {['3', '6', '12'].map((val) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                range === val
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Last {val} Months
            </button>
          ))}
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Income vs Expenses ({range}M)</span>
            </h3>
          </div>
          <div className="h-72">
            <Bar
              data={incomeExpenseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
                },
                scales: {
                  y: {
                    ticks: { callback: (v) => `${symbol}${v >= 1000 ? `${v / 1000}k` : v}` }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Expense Categorization</span>
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {catLabels.length > 0 ? (
              <Doughnut
                data={categoryDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } }
                  }
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">No expense categories recorded</p>
            )}
          </div>
        </div>

        {/* Net Savings Trajectory */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Net Monthly Savings Trajectory</span>
            </h3>
          </div>
          <div className="h-72">
            <Line
              data={savingsTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    ticks: { callback: (v) => `${symbol}${v >= 1000 ? `${v / 1000}k` : v}` }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-600" />
              <span>Payment Channels Distribution</span>
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {pmLabels.length > 0 ? (
              <Doughnut
                data={paymentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } }
                  }
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">No payment data recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
