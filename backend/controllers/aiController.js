const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const {
  analyzeSpendingPatterns,
  generateSavingsSuggestions,
  simulateSavingsImpact,
  queryFinancialAdvisor
} = require('../services/aiEngine');

// @desc    Get AI Spending Insights & Quantified Savings Suggestions
// @route   GET /api/ai/insights
// @access  Private
const getAIInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const [transactions, goals, budgets] = await Promise.all([
      Transaction.find({ user: userId }).sort('date'),
      Goal.find({ user: userId }),
      Budget.find({ user: userId })
    ]);

    // 1. Analyze historical spending patterns
    const patternAnalysis = analyzeSpendingPatterns(transactions, goals, budgets);

    // 2. Generate actionable, quantified savings suggestions based on previous patterns
    const savingsSuggestions = generateSavingsSuggestions(patternAnalysis, goals);

    res.json({
      patternAnalysis,
      savingsSuggestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Run What-If Savings Simulator
// @route   POST /api/ai/simulate
// @access  Private
const runSavingsSimulator = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reductions } = req.body; // e.g. { "Food & Dining": 25, "Shopping": 30 }

    if (!reductions || typeof reductions !== 'object') {
      return res.status(400).json({ message: 'Reductions object is required' });
    }

    // Get current month expense breakdown
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const start = new Date(curYear, curMonth, 1);
    const end = new Date(curYear, curMonth + 1, 0, 23, 59, 59, 999);

    const [transactions, goals] = await Promise.all([
      Transaction.find({ user: userId, type: 'expense', date: { $gte: start, $lte: end } }),
      Goal.find({ user: userId })
    ]);

    const categorySpends = {};
    transactions.forEach((tx) => {
      categorySpends[tx.category] = (categorySpends[tx.category] || 0) + tx.amount;
    });

    const simulation = simulateSavingsImpact(categorySpends, reductions, goals);

    res.json(simulation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with FinTrack AI Financial Advisor
// @route   POST /api/ai/chat
// @access  Private
const chatWithAdvisor = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Question/message is required' });
    }

    const userId = req.user._id;

    // Fetch brief financial context
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [transactions, goals] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: start, $lte: end } }),
      Goal.find({ user: userId })
    ]);

    let inc = 0;
    let exp = 0;
    const catMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') inc += tx.amount;
      else {
        exp += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    });

    const financialContext = {
      totalIncome: inc,
      totalExpense: exp,
      netSavings: inc - exp,
      topCategories: catMap,
      goals: goals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount }))
    };

    const reply = await queryFinancialAdvisor(message, financialContext);

    res.json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAIInsights,
  runSavingsSimulator,
  chatWithAdvisor
};
