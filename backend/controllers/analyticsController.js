const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// Helper to get month string YYYY-MM
const getMonthString = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Helper for date range
const getMonthDateRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc    Dashboard overview metrics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = getMonthString(now);

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = getMonthString(prevDate);

    const curRange = getMonthDateRange(currentMonth);
    const prevRange = getMonthDateRange(prevMonth);

    // Fetch transactions
    const [currentTxs, prevTxs, recentTxs, currentBudget, goals] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: curRange.start, $lte: curRange.end } }),
      Transaction.find({ user: userId, date: { $gte: prevRange.start, $lte: prevRange.end } }),
      Transaction.find({ user: userId }).sort('-date').limit(6),
      Budget.findOne({ user: userId, month: currentMonth }),
      Goal.find({ user: userId }).sort('targetDate').limit(3)
    ]);

    // Current month totals
    let currentIncome = 0;
    let currentExpense = 0;
    const categoryExpenses = {};

    currentTxs.forEach((tx) => {
      if (tx.type === 'income') {
        currentIncome += tx.amount;
      } else {
        currentExpense += tx.amount;
        categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
      }
    });

    const currentSavings = currentIncome - currentExpense;
    const currentSavingsRate = currentIncome > 0 ? Math.round((currentSavings / currentIncome) * 100) : 0;

    // Previous month totals
    let prevIncome = 0;
    let prevExpense = 0;

    prevTxs.forEach((tx) => {
      if (tx.type === 'income') prevIncome += tx.amount;
      else prevExpense += tx.amount;
    });

    const incomeChangePct = prevIncome > 0 ? Math.round(((currentIncome - prevIncome) / prevIncome) * 100) : 0;
    const expenseChangePct = prevExpense > 0 ? Math.round(((currentExpense - prevExpense) / prevExpense) * 100) : 0;

    // Daily spending trend in current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailySpending = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, expense: 0, income: 0 }));

    currentTxs.forEach((tx) => {
      const d = new Date(tx.date).getDate();
      if (d >= 1 && d <= daysInMonth) {
        if (tx.type === 'expense') dailySpending[d - 1].expense += tx.amount;
        else dailySpending[d - 1].income += tx.amount;
      }
    });

    res.json({
      month: currentMonth,
      summary: {
        totalIncome: currentIncome,
        totalExpense: currentExpense,
        netSavings: currentSavings,
        savingsRate: currentSavingsRate,
        incomeChangePct,
        expenseChangePct
      },
      categoryExpenses,
      dailySpending,
      recentTransactions: recentTxs,
      budget: currentBudget
        ? {
            totalBudget: currentBudget.totalBudget,
            spent: currentExpense,
            remaining: currentBudget.totalBudget - currentExpense,
            percentage: currentBudget.totalBudget > 0 ? Math.round((currentExpense / currentBudget.totalBudget) * 100) : 0
          }
        : null,
      goals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Interactive Charts Data (Monthly Trends, Category Distribution, Payment Methods)
// @route   GET /api/analytics/charts
// @access  Private
const getInteractiveChartsData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = '6' } = req.query; // months
    const monthsCount = parseInt(range, 10) || 6;

    const allTxs = await Transaction.find({ user: userId }).sort('date');

    // Aggregate by month
    const monthlyMap = {};
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyMap[mStr] = { month: mStr, label, income: 0, expense: 0, savings: 0 };
    }

    const categoryMap = {};
    const paymentMap = {};

    allTxs.forEach((tx) => {
      const d = new Date(tx.date);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyMap[mStr]) {
        if (tx.type === 'income') {
          monthlyMap[mStr].income += tx.amount;
        } else {
          monthlyMap[mStr].expense += tx.amount;
        }
        monthlyMap[mStr].savings = monthlyMap[mStr].income - monthlyMap[mStr].expense;
      }

      // Count recent category distribution
      if (tx.type === 'expense') {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        paymentMap[tx.paymentMethod || 'UPI'] = (paymentMap[tx.paymentMethod || 'UPI'] || 0) + tx.amount;
      }
    });

    const monthlyTrends = Object.values(monthlyMap);

    res.json({
      monthlyTrends,
      categoryDistribution: categoryMap,
      paymentDistribution: paymentMap
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Detailed Monthly Report
// @route   GET /api/analytics/report/:month
// @access  Private
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    let month = req.params.month;
    if (!month || month === 'current') {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const { start, end } = getMonthDateRange(month);

    const [transactions, budget] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: start, $lte: end } }).sort('date'),
      Budget.findOne({ user: userId, month })
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const paymentTotals = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
      paymentTotals[tx.paymentMethod || 'UPI'] = (paymentTotals[tx.paymentMethod || 'UPI'] || 0) + tx.amount;
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Top 3 Expense Categories
    const sortedCategories = Object.entries(categoryTotals)
      .map(([cat, amt]) => ({ category: cat, amount: amt, percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);

    const topCategories = sortedCategories.slice(0, 3);

    // Calculate Financial Health / Adherence Score (0-100)
    let adherenceScore = 70; // baseline
    if (savingsRate >= 20) adherenceScore += 15;
    else if (savingsRate >= 10) adherenceScore += 5;
    else if (savingsRate < 0) adherenceScore -= 25;

    if (budget && budget.totalBudget > 0) {
      if (totalExpense <= budget.totalBudget) adherenceScore += 15;
      else adherenceScore -= 20;
    }

    adherenceScore = Math.max(10, Math.min(100, adherenceScore));

    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const dailyAverageSpend = Math.round(totalExpense / daysInMonth);

    res.json({
      month,
      metrics: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        dailyAverageSpend,
        transactionCount: transactions.length,
        adherenceScore
      },
      topCategories,
      categoryBreakdown: sortedCategories,
      paymentBreakdown: paymentTotals,
      budgetComparison: budget
        ? {
            budgetLimit: budget.totalBudget,
            actualSpend: totalExpense,
            variance: budget.totalBudget - totalExpense,
            adhered: totalExpense <= budget.totalBudget
          }
        : null,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getInteractiveChartsData,
  getMonthlyReport
};
