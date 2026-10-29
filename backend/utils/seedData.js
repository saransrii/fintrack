const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

const seedUserData = async (userId) => {
  try {
    // Clear existing data for fresh seed
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed

    // Format months YYYY-MM
    const formatM = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;
    const mCurrent = formatM(curYear, curMonth);
    const mPrev = formatM(curMonth === 0 ? curYear - 1 : curYear, (curMonth + 11) % 12);
    const mTwoAgo = formatM(curMonth <= 1 ? curYear - 1 : curYear, (curMonth + 10) % 12);

    const txs = [];

    // Helper to generate date in a given month offset (0 = current, 1 = prev, 2 = two ago)
    const getDate = (monthOffset, day) => {
      const d = new Date(curYear, curMonth - monthOffset, day, 12, 0, 0);
      return d;
    };

    // --- 2 Months Ago Transactions ---
    txs.push(
      { user: userId, title: 'Monthly Salary Credit', amount: 65000, type: 'income', category: 'Salary', paymentMethod: 'Net Banking', date: getDate(2, 1) },
      { user: userId, title: 'Apartment Rent', amount: 18000, type: 'expense', category: 'Rent & Housing', paymentMethod: 'Net Banking', date: getDate(2, 2) },
      { user: userId, title: 'Electricity Bill', amount: 2200, type: 'expense', category: 'Utilities', paymentMethod: 'UPI', date: getDate(2, 5) },
      { user: userId, title: 'WiFi & Fiber', amount: 1199, type: 'expense', category: 'Utilities', paymentMethod: 'UPI', date: getDate(2, 6) },
      { user: userId, title: 'Supermarket Groceries', amount: 4800, type: 'expense', category: 'Groceries', paymentMethod: 'Credit Card', date: getDate(2, 8) },
      { user: userId, title: 'Swiggy Dinner with Friends', amount: 1450, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(2, 10) },
      { user: userId, title: 'Shell Petrol Fill-up', amount: 2500, type: 'expense', category: 'Transportation', paymentMethod: 'Credit Card', date: getDate(2, 12) },
      { user: userId, title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: getDate(2, 15), isRecurring: true },
      { user: userId, title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: getDate(2, 16), isRecurring: true },
      { user: userId, title: 'Weekend Cafe Outing', amount: 980, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(2, 18) },
      { user: userId, title: 'Amazon Essentials', amount: 2400, type: 'expense', category: 'Shopping', paymentMethod: 'Credit Card', date: getDate(2, 22) }
    );

    // --- 1 Month Ago Transactions ---
    txs.push(
      { user: userId, title: 'Monthly Salary Credit', amount: 65000, type: 'income', category: 'Salary', paymentMethod: 'Net Banking', date: getDate(1, 1) },
      { user: userId, title: 'Freelance Design Retainer', amount: 15000, type: 'income', category: 'Freelance & Business', paymentMethod: 'UPI', date: getDate(1, 14) },
      { user: userId, title: 'Apartment Rent', amount: 18000, type: 'expense', category: 'Rent & Housing', paymentMethod: 'Net Banking', date: getDate(1, 2) },
      { user: userId, title: 'Electricity & Gas Bill', amount: 2650, type: 'expense', category: 'Utilities', paymentMethod: 'UPI', date: getDate(1, 4) },
      { user: userId, title: 'WiFi Broadband', amount: 1199, type: 'expense', category: 'Utilities', paymentMethod: 'UPI', date: getDate(1, 5) },
      { user: userId, title: 'BigBasket Monthly Pantry', amount: 6400, type: 'expense', category: 'Groceries', paymentMethod: 'Credit Card', date: getDate(1, 7) },
      { user: userId, title: 'Swiggy Gourmet Dinner', amount: 1850, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(1, 9) },
      { user: userId, title: 'Zomato Lunch Orders', amount: 1200, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(1, 11) },
      { user: userId, title: 'Shell Petrol', amount: 2800, type: 'expense', category: 'Transportation', paymentMethod: 'Credit Card', date: getDate(1, 13) },
      { user: userId, title: 'Uber Commute', amount: 840, type: 'expense', category: 'Transportation', paymentMethod: 'UPI', date: getDate(1, 14) },
      { user: userId, title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: getDate(1, 15), isRecurring: true },
      { user: userId, title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: getDate(1, 16), isRecurring: true },
      { user: userId, title: 'Cult.fit Gym Pass', amount: 2200, type: 'expense', category: 'Health & Fitness', paymentMethod: 'Debit Card', date: getDate(1, 18) },
      { user: userId, title: 'Myntra Weekend Wardrobe', amount: 5600, type: 'expense', category: 'Shopping', paymentMethod: 'Credit Card', date: getDate(1, 20) },
      { user: userId, title: 'Saturday Bar & Lounge', amount: 3200, type: 'expense', category: 'Food & Dining', paymentMethod: 'Credit Card', date: getDate(1, 22) },
      { user: userId, title: 'Sunday Bistro Brunch', amount: 1800, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(1, 23) },
      { user: userId, title: 'Blinkit Late Night Snacks', amount: 480, type: 'expense', category: 'Groceries', paymentMethod: 'UPI', date: getDate(1, 25) },
      { user: userId, title: 'Chai & Snacks', amount: 160, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(1, 27) }
    );

    // --- Current Month Transactions ---
    txs.push(
      { user: userId, title: 'Monthly Salary Credit', amount: 65000, type: 'income', category: 'Salary', paymentMethod: 'Net Banking', date: getDate(0, 1) },
      { user: userId, title: 'Apartment Rent', amount: 18000, type: 'expense', category: 'Rent & Housing', paymentMethod: 'Net Banking', date: getDate(0, 2) },
      { user: userId, title: 'Electricity Bill', amount: 2450, type: 'expense', category: 'Utilities', paymentMethod: 'UPI', date: getDate(0, 3) },
      { user: userId, title: 'Airtel Broadband Fiber', amount: 1199, type: 'expense', category: 'Utilities', paymentMethod: 'UPI', date: getDate(0, 4) },
      { user: userId, title: 'Zepto Quick Groceries', amount: 3200, type: 'expense', category: 'Groceries', paymentMethod: 'UPI', date: getDate(0, 5) },
      { user: userId, title: 'Swiggy Biryani Feast', amount: 1650, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(0, 7) },
      { user: userId, title: 'Starbucks Coffee Meeting', amount: 780, type: 'expense', category: 'Food & Dining', paymentMethod: 'Credit Card', date: getDate(0, 9) },
      { user: userId, title: 'Shell Petrol Fill-up', amount: 2600, type: 'expense', category: 'Transportation', paymentMethod: 'Credit Card', date: getDate(0, 10) },
      { user: userId, title: 'Uber Ride to Tech Park', amount: 620, type: 'expense', category: 'Transportation', paymentMethod: 'UPI', date: getDate(0, 12) },
      { user: userId, title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: getDate(0, 15), isRecurring: true },
      { user: userId, title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: getDate(0, 16), isRecurring: true },
      { user: userId, title: 'Amazon Electronics & Cable', amount: 3450, type: 'expense', category: 'Shopping', paymentMethod: 'Credit Card', date: getDate(0, 17) },
      { user: userId, title: 'Apollo Pharmacy Medicines', amount: 1250, type: 'expense', category: 'Health & Fitness', paymentMethod: 'UPI', date: getDate(0, 19) },
      { user: userId, title: 'Weekend Dining with Family', amount: 2950, type: 'expense', category: 'Food & Dining', paymentMethod: 'Credit Card', date: getDate(0, 21) },
      { user: userId, title: 'PVR Cinema IMAX Tickets', amount: 1400, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: getDate(0, 22) },
      { user: userId, title: 'Blinkit Snacks & Drinks', amount: 560, type: 'expense', category: 'Groceries', paymentMethod: 'UPI', date: getDate(0, 24) },
      { user: userId, title: 'Tea & Samosa Stall', amount: 120, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(0, 25) },
      { user: userId, title: 'Bakery Pastries', amount: 380, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: getDate(0, 26) }
    );

    await Transaction.insertMany(txs);

    // Seed Monthly Budgets
    const budgetCategories = [
      { category: 'Rent & Housing', limit: 18000 },
      { category: 'Food & Dining', limit: 6500 },
      { category: 'Groceries', limit: 6000 },
      { category: 'Transportation', limit: 4500 },
      { category: 'Utilities', limit: 4000 },
      { category: 'Shopping', limit: 5000 },
      { category: 'Entertainment', limit: 3000 },
      { category: 'Health & Fitness', limit: 3000 }
    ];

    await Budget.create({
      user: userId,
      month: mCurrent,
      totalBudget: 50000,
      categoryBudgets: budgetCategories,
      alertThreshold: 85
    });

    await Budget.create({
      user: userId,
      month: mPrev,
      totalBudget: 48000,
      categoryBudgets: budgetCategories,
      alertThreshold: 85
    });

    // Seed Savings Goals
    const targetDateEmergency = new Date();
    targetDateEmergency.setMonth(targetDateEmergency.getMonth() + 6);

    const targetDateLaptop = new Date();
    targetDateLaptop.setMonth(targetDateLaptop.getMonth() + 4);

    const targetDateVacation = new Date();
    targetDateVacation.setMonth(targetDateVacation.getMonth() + 8);

    await Goal.create([
      {
        user: userId,
        name: 'Emergency Fund (6 Months)',
        targetAmount: 120000,
        currentAmount: 75000,
        targetDate: targetDateEmergency,
        category: 'Emergency',
        monthlyContribution: 10000,
        color: '#10B981', // emerald
        icon: 'ShieldCheck',
        notes: 'High-yield liquid emergency reserve for complete peace of mind.',
        contributions: [
          { amount: 10000, date: getDate(2, 5), note: 'Monthly auto-allocation' },
          { amount: 15000, date: getDate(1, 5), note: 'Bonus allocation' },
          { amount: 10000, date: getDate(0, 5), note: 'Monthly auto-allocation' }
        ]
      },
      {
        user: userId,
        name: 'Apple MacBook Pro M3',
        targetAmount: 140000,
        currentAmount: 84000,
        targetDate: targetDateLaptop,
        category: 'Tech & Gadgets',
        monthlyContribution: 15000,
        color: '#3B82F6', // blue
        icon: 'Laptop',
        notes: 'For freelance development and high-performance workflow.',
        contributions: [
          { amount: 12000, date: getDate(2, 10), note: 'Freelance earnings' },
          { amount: 15000, date: getDate(1, 10), note: 'Monthly savings' },
          { amount: 15000, date: getDate(0, 10), note: 'Monthly savings' }
        ]
      },
      {
        user: userId,
        name: 'Bali Vacation Trip',
        targetAmount: 80000,
        currentAmount: 32000,
        targetDate: targetDateVacation,
        category: 'Travel',
        monthlyContribution: 8000,
        color: '#8B5CF6', // purple
        icon: 'Palmtree',
        notes: 'Flights, beachfront resort stay, and scuba diving adventures.',
        contributions: [
          { amount: 8000, date: getDate(2, 15), note: 'Trip bucket start' },
          { amount: 8000, date: getDate(1, 15), note: 'Monthly trip SIP' },
          { amount: 8000, date: getDate(0, 15), note: 'Monthly trip SIP' }
        ]
      }
    ]);

    console.log(`[SeedData] Successfully seeded demo data for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('[SeedData Error]', error.message);
    return false;
  }
};

module.exports = { seedUserData };
