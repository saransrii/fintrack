const Goal = require('../models/Goal');

// Helper to compute goal metrics
const computeGoalMetrics = (goal) => {
  const g = goal.toObject ? goal.toObject() : goal;
  const target = Number(g.targetAmount) || 1;
  const current = Number(g.currentAmount) || 0;
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  const now = new Date();
  const targetDate = new Date(g.targetDate);
  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.max(1, Math.ceil(diffDays / 30));

  const recommendedMonthlyDeposit = remaining > 0 ? Math.ceil(remaining / diffMonths) : 0;

  return {
    ...g,
    percentage,
    remainingAmount: remaining,
    daysRemaining: Math.max(0, diffDays),
    monthsRemaining: diffMonths,
    recommendedMonthlyDeposit,
    isOverdue: diffDays < 0 && !g.isCompleted
  };
};

// @desc    Get all savings goals with calculated metrics
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort('targetDate');
    const enriched = goals.map(computeGoalMetrics);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new savings goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, category, monthlyContribution, color, icon, notes } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ message: 'Name, target amount, and target date are required' });
    }

    const initCurrent = Number(currentAmount) || 0;
    const initContributions = initCurrent > 0 ? [{ amount: initCurrent, date: new Date(), note: 'Initial allocation' }] : [];

    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: initCurrent,
      targetDate: new Date(targetDate),
      category: category || 'General Savings',
      monthlyContribution: Number(monthlyContribution) || 0,
      color: color || '#10B981',
      icon: icon || 'Target',
      notes: notes || '',
      contributions: initContributions,
      isCompleted: initCurrent >= Number(targetAmount)
    });

    res.status(201).json(computeGoalMetrics(goal));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { name, targetAmount, currentAmount, targetDate, category, monthlyContribution, color, icon, notes, isCompleted } = req.body;

    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
    if (category !== undefined) goal.category = category;
    if (monthlyContribution !== undefined) goal.monthlyContribution = Number(monthlyContribution);
    if (color !== undefined) goal.color = color;
    if (icon !== undefined) goal.icon = icon;
    if (notes !== undefined) goal.notes = notes;
    if (isCompleted !== undefined) goal.isCompleted = Boolean(isCompleted);

    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    const updated = await goal.save();
    res.json(computeGoalMetrics(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Contribute funds to savings goal
// @route   POST /api/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const addAmt = Number(amount);

    if (!addAmt || addAmt <= 0) {
      return res.status(400).json({ message: 'Please provide a valid contribution amount' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount += addAmt;
    goal.contributions.push({
      amount: addAmt,
      date: new Date(),
      note: note || 'Contribution'
    });

    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    const updated = await goal.save();
    res.json(computeGoalMetrics(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  contributeToGoal,
  deleteGoal
};
