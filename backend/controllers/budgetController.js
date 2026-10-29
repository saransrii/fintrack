const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Helper to get start and end dates of a 'YYYY-MM'
const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc    Get budget for a specific month with actual spend & alerts
// @route   GET /api/budgets/month/:month
// @access  Private
const getBudgetForMonth = async (req, res) => {
  try {
    let month = req.params.month;
    if (!month || month === 'current') {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const { start, end } = getMonthRange(month);

    // Fetch budget document
    let budget = await Budget.findOne({ user: req.user._id, month });

    // Fetch actual expenses for the month
    const expenses = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: start, $lte: end }
    });

    const categorySpends = {};
    let totalSpent = 0;

    expenses.forEach((tx) => {
      totalSpent += tx.amount;
      categorySpends[tx.category] = (categorySpends[tx.category] || 0) + tx.amount;
    });

    // If no budget set yet, return default template
    if (!budget) {
      return res.json({
        exists: false,
        month,
        totalBudget: 0,
        totalSpent,
        remaining: -totalSpent,
        alertThreshold: 85,
        categoryBudgets: [],
        alerts: []
      });
    }

    // Calculate per-category budget status & alerts
    const alerts = [];
    const categoryAnalysis = budget.categoryBudgets.map((cb) => {
      const spent = categorySpends[cb.category] || 0;
      const remaining = cb.limit - spent;
      const percentage = cb.limit > 0 ? Math.round((spent / cb.limit) * 100) : 0;
      const isExceeded = spent > cb.limit;
      const isNearLimit = percentage >= (budget.alertThreshold || 85) && !isExceeded;

      if (isExceeded) {
        alerts.push({
          type: 'danger',
          category: cb.category,
          message: `Budget exceeded by ₹${Math.abs(remaining).toLocaleString()} (${percentage}% spent)`
        });
      } else if (isNearLimit) {
        alerts.push({
          type: 'warning',
          category: cb.category,
          message: `Budget warning: ${percentage}% spent (₹${remaining.toLocaleString()} left)`
        });
      }

      return {
        category: cb.category,
        limit: cb.limit,
        spent,
        remaining,
        percentage,
        isExceeded,
        isNearLimit
      };
    });

    const totalBudgetPercentage = budget.totalBudget > 0 ? Math.round((totalSpent / budget.totalBudget) * 100) : 0;

    res.json({
      exists: true,
      _id: budget._id,
      month: budget.month,
      totalBudget: budget.totalBudget,
      totalSpent,
      remainingBudget: budget.totalBudget - totalSpent,
      totalPercentage: totalBudgetPercentage,
      alertThreshold: budget.alertThreshold,
      categories: categoryAnalysis,
      alerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update monthly budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
  try {
    const { month, totalBudget, categoryBudgets, alertThreshold } = req.body;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }

    if (totalBudget === undefined || totalBudget < 0) {
      return res.status(400).json({ message: 'Valid total budget is required' });
    }

    const updated = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      {
        user: req.user._id,
        month,
        totalBudget: Number(totalBudget),
        categoryBudgets: categoryBudgets || [],
        alertThreshold: Number(alertThreshold) || 85
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all historical budgets
// @route   GET /api/budgets
// @access  Private
const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort('-month');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgetForMonth,
  setBudget,
  getAllBudgets
};
