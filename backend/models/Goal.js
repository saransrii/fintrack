const mongoose = require('mongoose');

const goalContributionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a goal name'],
      trim: true,
      maxlength: 80
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide target amount'],
      min: [1, 'Target amount must be at least 1']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date']
    },
    category: {
      type: String,
      default: 'General Savings',
      enum: ['Emergency', 'Travel', 'Tech & Gadgets', 'Investment', 'Vehicle', 'Home', 'Education', 'Wedding', 'General Savings', 'Other']
    },
    monthlyContribution: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#10B981' // emerald-500 default
    },
    icon: {
      type: String,
      default: 'Target'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true
    },
    contributions: [goalContributionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
