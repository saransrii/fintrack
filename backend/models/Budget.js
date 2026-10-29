const mongoose = require('mongoose');

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    month: {
      type: String, // e.g. '2026-10'
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Please provide month in YYYY-MM format']
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0
    },
    categoryBudgets: [categoryBudgetSchema],
    alertThreshold: {
      type: Number,
      default: 85, // Alert user when category reaches 85% of limit
      min: 50,
      max: 100
    }
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
