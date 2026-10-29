const Transaction = require('../models/Transaction');
const { predictCategory } = require('../services/aiEngine');
const { seedUserData } = require('../utils/seedData');

// @desc    Get all transactions with filtering, search & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      search,
      startDate,
      endDate,
      month,
      page = 1,
      limit = 50,
      sort = '-date'
    } = req.query;

    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, notes, isRecurring, tags } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({ message: 'Please provide title, amount, and type' });
    }

    let resolvedCategory = category;
    if (!resolvedCategory || resolvedCategory === 'Auto-Detect') {
      const prediction = predictCategory(title, amount);
      resolvedCategory = prediction.category;
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category: resolvedCategory,
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      isRecurring: Boolean(isRecurring),
      tags: tags || []
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { title, amount, type, category, paymentMethod, date, notes, isRecurring, tags } = req.body;

    if (title !== undefined) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (date !== undefined) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes;
    if (isRecurring !== undefined) transaction.isRecurring = Boolean(isRecurring);
    if (tags !== undefined) transaction.tags = tags;

    const updated = await transaction.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Predict Category & Tags for transaction title
// @route   POST /api/transactions/predict-category
// @access  Private
const predictCategoryEndpoint = async (req, res) => {
  try {
    const { title, amount } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required for categorization' });
    }
    const result = predictCategory(title, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed sample transactions & data for current user
// @route   POST /api/transactions/seed
// @access  Private
const seedSampleData = async (req, res) => {
  try {
    const success = await seedUserData(req.user._id);
    if (success) {
      res.json({ message: 'Sample financial dataset loaded successfully!' });
    } else {
      res.status(500).json({ message: 'Could not complete seeding' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
// @access  Private
const exportTransactionsCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort('-date');

    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Recurring', 'Notes'];
    const rows = transactions.map((t) => {
      const d = new Date(t.date).toISOString().split('T')[0];
      const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      return [d, cleanTitle, t.type, t.category, t.amount, t.paymentMethod, t.isRecurring ? 'Yes' : 'No', cleanNotes].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fintrack_transactions.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  predictCategoryEndpoint,
  seedSampleData,
  exportTransactionsCSV
};
