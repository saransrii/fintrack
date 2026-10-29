/**
 * FinTrack AI Analytics & Intelligent Savings Engine
 * Special Feature: Analyzes historical spending patterns to provide quantified, actionable savings suggestions.
 */

// Category dictionary for auto-categorization
const CATEGORY_RULES = [
  {
    category: 'Food & Dining',
    keywords: ['swiggy', 'zomato', 'restaurant', 'cafe', 'starbucks', 'mcdonalds', 'kfc', 'burger', 'pizza', 'dinner', 'lunch', 'breakfast', 'tea', 'chai', 'bistro', 'food', 'bakery', 'subway', 'dominos', 'eat']
  },
  {
    category: 'Groceries',
    keywords: ['blinkit', 'zepto', 'instamart', 'bigbasket', 'supermarket', 'grocery', 'vegetables', 'fruits', 'milk', 'bread', 'mart', 'dmart', 'nature basket', 'provisions']
  },
  {
    category: 'Rent & Housing',
    keywords: ['rent', 'landlord', 'apartment', 'flat', 'maintenance', 'housing', 'lease', 'society maintenance', 'brokerage']
  },
  {
    category: 'Utilities',
    keywords: ['electricity', 'tneb', 'bescom', 'water bill', 'wifi', 'broadband', 'airtel', 'jio', 'vi', 'gas bill', 'cylinder', 'dth', 'tata play', 'utility', 'mobile recharge']
  },
  {
    category: 'Transportation',
    keywords: ['uber', 'ola', 'rapido', 'metro', 'petrol', 'diesel', 'fuel', 'shell', 'hp fuel', 'toll', 'parking', 'flight', 'irctc', 'train ticket', 'bus ticket', 'auto fare', 'cab']
  },
  {
    category: 'Entertainment',
    keywords: ['netflix', 'spotify', 'amazon prime', 'hotstar', 'cinema', 'pvr', 'inox', 'movie', 'concert', 'game', 'steam', 'playstation', 'youtube premium', 'audible', 'club']
  },
  {
    category: 'Health & Fitness',
    keywords: ['gym', 'cult.fit', 'cult', 'pharmacy', 'apollo', 'medplus', 'doctor', 'hospital', 'clinic', 'dentist', 'medicine', 'lab test', 'fitness', 'protein', 'consultation']
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'clothing', 'shoes', 'electronics', 'ajio', 'mall', 'shopping', 'nykaa', 'tissot', 'watch', 'apparel', 'gadget']
  },
  {
    category: 'Education',
    keywords: ['udemy', 'coursera', 'course', 'books', 'tuition', 'college fee', 'school fee', 'exam', 'certification', 'training', 'library']
  },
  {
    category: 'Personal Care',
    keywords: ['salon', 'spa', 'haircut', 'barber', 'skincare', 'cosmetics', 'grooming', 'parlour']
  },
  {
    category: 'Investments',
    keywords: ['zerodha', 'groww', 'mutual fund', 'sip', 'stocks', 'crypto', 'fd', 'fixed deposit', 'nps', 'gold', 'shares', 'ppf', 'etf']
  },
  {
    category: 'Salary',
    keywords: ['salary', 'payroll', 'wages', 'stipend', 'employer']
  },
  {
    category: 'Freelance & Business',
    keywords: ['freelance', 'upwork', 'fiverr', 'client payment', 'consulting fee', 'contract', 'invoice paid']
  }
];

// Discretionary categories where savings cuts can realistically happen
const DISCRETIONARY_CATEGORIES = [
  'Food & Dining',
  'Entertainment',
  'Shopping',
  'Personal Care',
  'Transportation'
];

/**
 * Predict Category and Type from Title / Description
 */
const predictCategory = (title = '', amount = 0) => {
  const cleanTitle = title.toLowerCase().trim();

  // Check income keywords
  if (['salary', 'payroll', 'wages', 'freelance', 'client payment', 'dividend', 'stipend', 'cashback', 'bonus'].some(k => cleanTitle.includes(k))) {
    const isSalary = cleanTitle.includes('salary') || cleanTitle.includes('payroll') || cleanTitle.includes('stipend');
    return {
      type: 'income',
      category: isSalary ? 'Salary' : 'Freelance & Business',
      confidence: 0.95,
      suggestedTags: [isSalary ? 'regular-income' : 'side-hustle']
    };
  }

  // Check expense rules
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (cleanTitle.includes(kw)) {
        return {
          type: 'expense',
          category: rule.category,
          confidence: 0.9,
          suggestedTags: [kw, rule.category.toLowerCase().replace(/[^a-z0-9]/g, '-')]
        };
      }
    }
  }

  return {
    type: 'expense',
    category: 'Miscellaneous',
    confidence: 0.4,
    suggestedTags: ['general']
  };
};

/**
 * Group transactions by month (YYYY-MM)
 */
const groupTransactionsByMonth = (transactions) => {
  const groups = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[m]) {
      groups[m] = {
        month: m,
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        transactions: [],
        categoryExpenses: {},
        categoryIncome: {},
        paymentMethods: {},
        weekendExpenses: 0,
        weekdayExpenses: 0,
        microTransactionsCount: 0, // < 300 spends
        microTransactionsSum: 0
      };
    }

    groups[m].transactions.push(tx);

    const amt = Number(tx.amount);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek === 5 && d.getHours() >= 18);

    if (tx.type === 'income') {
      groups[m].totalIncome += amt;
      groups[m].categoryIncome[tx.category] = (groups[m].categoryIncome[tx.category] || 0) + amt;
    } else {
      groups[m].totalExpense += amt;
      groups[m].categoryExpenses[tx.category] = (groups[m].categoryExpenses[tx.category] || 0) + amt;

      if (isWeekend) {
        groups[m].weekendExpenses += amt;
      } else {
        groups[m].weekdayExpenses += amt;
      }

      if (amt <= 300) {
        groups[m].microTransactionsCount += 1;
        groups[m].microTransactionsSum += amt;
      }
    }

    const pm = tx.paymentMethod || 'UPI';
    groups[m].paymentMethods[pm] = (groups[m].paymentMethods[pm] || 0) + amt;
  });

  // Calculate net savings
  Object.keys(groups).forEach((m) => {
    groups[m].netSavings = groups[m].totalIncome - groups[m].totalExpense;
    groups[m].savingsRate = groups[m].totalIncome > 0
      ? Math.round((groups[m].netSavings / groups[m].totalIncome) * 100)
      : 0;
  });

  return groups;
};

/**
 * Analyze Historical Spending Patterns
 */
const analyzeSpendingPatterns = (transactions, goals = [], budgets = []) => {
  if (!transactions || transactions.length === 0) {
    return {
      hasData: false,
      message: 'No transaction data available to analyze yet.'
    };
  }

  const monthlyGroups = groupTransactionsByMonth(transactions);
  const sortedMonths = Object.keys(monthlyGroups).sort();
  const currentMonthKey = sortedMonths[sortedMonths.length - 1];
  const previousMonthKey = sortedMonths.length > 1 ? sortedMonths[sortedMonths.length - 2] : null;

  const currentMonthData = monthlyGroups[currentMonthKey];
  const prevMonthData = previousMonthKey ? monthlyGroups[previousMonthKey] : null;

  // 1. Month-over-Month Category Drift
  const categoryTrends = [];
  const currentCategories = currentMonthData ? currentMonthData.categoryExpenses : {};
  const prevCategories = prevMonthData ? prevMonthData.categoryExpenses : {};

  const allCategories = Array.from(new Set([...Object.keys(currentCategories), ...Object.keys(prevCategories)]));

  allCategories.forEach((cat) => {
    const curSpend = currentCategories[cat] || 0;
    const prevSpend = prevCategories[cat] || 0;
    const diff = curSpend - prevSpend;
    const percentChange = prevSpend > 0 ? Math.round((diff / prevSpend) * 100) : (curSpend > 0 ? 100 : 0);

    categoryTrends.push({
      category: cat,
      currentSpend: curSpend,
      previousSpend: prevSpend,
      difference: diff,
      percentChange,
      isIncreased: diff > 0,
      isDiscretionary: DISCRETIONARY_CATEGORIES.includes(cat)
    });
  });

  // Sort by highest current spend
  categoryTrends.sort((a, b) => b.currentSpend - a.currentSpend);

  // 2. Detect recurring subscriptions
  const recurringCharges = [];
  const titleFrequency = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((tx) => {
      const norm = tx.title.toLowerCase().trim();
      if (!titleFrequency[norm]) {
        titleFrequency[norm] = { title: tx.title, category: tx.category, occurrences: 0, totalAmt: 0, amounts: [] };
      }
      titleFrequency[norm].occurrences += 1;
      titleFrequency[norm].totalAmt += tx.amount;
      titleFrequency[norm].amounts.push(tx.amount);
    });

  Object.values(titleFrequency).forEach((item) => {
    if (item.occurrences >= 2) {
      const avg = Math.round(item.totalAmt / item.occurrences);
      recurringCharges.push({
        name: item.title,
        category: item.category,
        occurrences: item.occurrences,
        averageAmount: avg,
        monthlyEstimated: avg,
        totalSpent: item.totalAmt
      });
    }
  });

  // 3. Weekend vs Weekday analysis
  const weekendPct = currentMonthData && currentMonthData.totalExpense > 0
    ? Math.round((currentMonthData.weekendExpenses / currentMonthData.totalExpense) * 100)
    : 0;

  // 4. Micro-transactions analysis
  const microSpends = {
    count: currentMonthData ? currentMonthData.microTransactionsCount : 0,
    total: currentMonthData ? currentMonthData.microTransactionsSum : 0,
    shareOfExpense: currentMonthData && currentMonthData.totalExpense > 0
      ? Math.round((currentMonthData.microTransactionsSum / currentMonthData.totalExpense) * 100)
      : 0
  };

  // 5. 50/30/20 Rule Analysis
  // Needs: Rent, Utilities, Groceries, Healthcare, Transportation (commute)
  // Wants: Dining, Entertainment, Shopping, Personal Care
  // Savings: Actual savings or investments
  let needsSpend = 0;
  let wantsSpend = 0;
  Object.keys(currentCategories).forEach((cat) => {
    const amt = currentCategories[cat];
    if (['Rent & Housing', 'Utilities', 'Groceries', 'Health & Fitness', 'Education'].includes(cat)) {
      needsSpend += amt;
    } else {
      wantsSpend += amt;
    }
  });

  const totalIncome = currentMonthData ? currentMonthData.totalIncome : 0;
  const actualSavings = currentMonthData ? Math.max(0, currentMonthData.netSavings) : 0;
  const fiftyThirtyTwenty = {
    income: totalIncome,
    needs: {
      actual: needsSpend,
      target: totalIncome * 0.5,
      actualPct: totalIncome > 0 ? Math.round((needsSpend / totalIncome) * 100) : 0,
      targetPct: 50
    },
    wants: {
      actual: wantsSpend,
      target: totalIncome * 0.3,
      actualPct: totalIncome > 0 ? Math.round((wantsSpend / totalIncome) * 100) : 0,
      targetPct: 30
    },
    savings: {
      actual: actualSavings,
      target: totalIncome * 0.2,
      actualPct: totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 0,
      targetPct: 20
    }
  };

  return {
    hasData: true,
    currentMonth: currentMonthKey,
    previousMonth: previousMonthKey,
    currentMonthData,
    prevMonthData,
    categoryTrends,
    recurringCharges,
    weekendAnalysis: {
      weekendExpenses: currentMonthData ? currentMonthData.weekendExpenses : 0,
      weekdayExpenses: currentMonthData ? currentMonthData.weekdayExpenses : 0,
      weekendPct
    },
    microSpends,
    fiftyThirtyTwenty,
    allMonths: sortedMonths.map((m) => monthlyGroups[m])
  };
};

/**
 * Generate Actionable Savings Suggestions based on historical patterns
 * (Satisfies: "Previous spending patterns based on savings suggestions provide pannum")
 */
const generateSavingsSuggestions = (analysis, goals = []) => {
  if (!analysis || !analysis.hasData) {
    return [
      {
        id: 'start_tracking',
        priority: 'high',
        category: 'General',
        title: 'Start Recording Transactions',
        description: 'Add your recent income and expenses to unlock tailored AI savings suggestions and pattern recognition.',
        potentialMonthlySavings: 0,
        difficulty: 'Easy',
        impactScore: 10
      }
    ];
  }

  const suggestions = [];
  const { categoryTrends, weekendAnalysis, microSpends, recurringCharges, fiftyThirtyTwenty, currentMonthData, prevMonthData } = analysis;

  // 1. Food & Dining / Food delivery cut suggestion
  const diningTrend = categoryTrends.find((t) => t.category === 'Food & Dining');
  if (diningTrend && diningTrend.currentSpend > 2500) {
    const spend = diningTrend.currentSpend;
    const cut25 = Math.round(spend * 0.25);
    const cut35 = Math.round(spend * 0.35);

    let goalImpactText = '';
    if (goals.length > 0) {
      const topGoal = goals.find((g) => !g.isCompleted) || goals[0];
      const remainingAmt = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);
      const monthsSaved = cut25 > 0 ? (remainingAmt / cut25).toFixed(1) : 0;
      goalImpactText = ` Redirecting this saving would fulfill "${topGoal.name}" approx. ${monthsSaved} months faster!`;
    }

    suggestions.push({
      id: 'dining_cut',
      priority: diningTrend.percentChange > 15 ? 'high' : 'medium',
      category: 'Food & Dining',
      title: 'Optimize Food Delivery & Dining Out',
      description: `You spent ₹${spend.toLocaleString()} on dining & delivery this month${diningTrend.percentChange > 0 ? ` (+${diningTrend.percentChange}% vs last month)` : ''}. Reducing takeout by just 25% frees up ₹${cut25.toLocaleString()}/month.${goalImpactText}`,
      currentMonthlySpend: spend,
      potentialMonthlySavings: cut25,
      alternativeOptionSavings: cut35,
      difficulty: 'Moderate',
      actionableTip: 'Try batch meal-prep on Sundays and set a weekly cap of 2 takeout meals.'
    });
  }

  // 2. Shopping / Impulsive purchases
  const shoppingTrend = categoryTrends.find((t) => t.category === 'Shopping');
  if (shoppingTrend && shoppingTrend.currentSpend > 3000) {
    const spend = shoppingTrend.currentSpend;
    const cut30 = Math.round(spend * 0.30);
    suggestions.push({
      id: 'shopping_cooling_period',
      priority: shoppingTrend.currentSpend > 7000 ? 'high' : 'medium',
      category: 'Shopping',
      title: 'Apply the 48-Hour Rule for Non-Essential Shopping',
      description: `Shopping spend reached ₹${spend.toLocaleString()} this month. Applying a 48-hour cooling period before buying non-essential items reduces impulse buying by an average of 30%, saving ~₹${cut30.toLocaleString()}/month.`,
      currentMonthlySpend: spend,
      potentialMonthlySavings: cut30,
      difficulty: 'Easy',
      actionableTip: 'Keep items in cart for 48 hours. If you still need them after two days, proceed with the purchase.'
    });
  }

  // 3. Weekend Spikes
  if (weekendAnalysis && weekendAnalysis.weekendPct >= 45 && currentMonthData.totalExpense > 5000) {
    const weekendTrim = Math.round(weekendAnalysis.weekendExpenses * 0.20);
    suggestions.push({
      id: 'weekend_budgeting',
      priority: 'high',
      category: 'Lifestyle',
      title: 'Tame Weekend Discretionary Spending',
      description: `Weekends account for ${weekendAnalysis.weekendPct}% of your total monthly outflow (₹${weekendAnalysis.weekendExpenses.toLocaleString()}). Establishing a strict weekend spending pocket can preserve ₹${weekendTrim.toLocaleString()} monthly.`,
      currentMonthlySpend: weekendAnalysis.weekendExpenses,
      potentialMonthlySavings: weekendTrim,
      difficulty: 'Moderate',
      actionableTip: 'Withdraw a fixed weekend cash/UPI allowance on Friday; once spent, pause discretionary entertainment.'
    });
  }

  // 4. Micro-transactions leakage
  if (microSpends && microSpends.total > 2000 && microSpends.count >= 8) {
    const microSavings = Math.round(microSpends.total * 0.40);
    suggestions.push({
      id: 'micro_spending_plug',
      priority: 'medium',
      category: 'Micro-Expenses',
      title: `Plug Small Transaction Leakage (${microSpends.count} Micro-Spends)`,
      description: `You logged ${microSpends.count} small transactions under ₹300, cumulatively totaling ₹${microSpends.total.toLocaleString()} (${microSpends.shareOfExpense}% of expenses). Consolidating snack, tea, and quick orders saves ~₹${microSavings.toLocaleString()}/month.`,
      currentMonthlySpend: microSpends.total,
      potentialMonthlySavings: microSavings,
      difficulty: 'Easy',
      actionableTip: 'Buy non-perishables and workplace snacks in monthly bulk instead of frequent single orders.'
    });
  }

  // 5. Recurring Subscriptions Audit
  if (recurringCharges && recurringCharges.length >= 2) {
    const totalSub = recurringCharges.reduce((acc, c) => acc + c.averageAmount, 0);
    suggestions.push({
      id: 'subscription_audit',
      priority: 'low',
      category: 'Entertainment & Subscriptions',
      title: `Audit ${recurringCharges.length} Recurring Subscriptions`,
      description: `You have ${recurringCharges.length} repeating recurring charges averaging ₹${totalSub.toLocaleString()} per cycle (${recurringCharges.map((r) => r.name).join(', ')}). Cancel or rotate subscriptions you haven't opened in 14 days.`,
      currentMonthlySpend: totalSub,
      potentialMonthlySavings: Math.round(totalSub * 0.35),
      difficulty: 'Easy',
      actionableTip: 'Switch from multi-platform active plans to single-platform rotation (watch 1 streaming app per month).'
    });
  }

  // 6. 50/30/20 Rule alignment suggestion
  if (fiftyThirtyTwenty && fiftyThirtyTwenty.income > 0) {
    if (fiftyThirtyTwenty.wants.actualPct > 35) {
      const overspentWants = fiftyThirtyTwenty.wants.actual - fiftyThirtyTwenty.wants.target;
      suggestions.push({
        id: 'wants_rebalance',
        priority: 'high',
        category: 'Budget Allocation',
        title: 'Rebalance Discretionary "Wants" (Currently at ' + fiftyThirtyTwenty.wants.actualPct + '%)',
        description: `Your "Wants" represent ${fiftyThirtyTwenty.wants.actualPct}% of income (ideal benchmark is 30%). Reclaiming ₹${Math.round(overspentWants).toLocaleString()} will instantly stabilize your savings rate toward the 20% golden target.`,
        currentMonthlySpend: fiftyThirtyTwenty.wants.actual,
        potentialMonthlySavings: Math.round(overspentWants),
        difficulty: 'Challenging',
        actionableTip: 'Automate transfer of 20% salary straight into a separate savings or liquid investment account on day 1.'
      });
    }
  }

  // Calculate total potential monthly savings
  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + (s.potentialMonthlySavings || 0), 0);
  const yearlyPotential = totalPotentialSavings * 12;

  return {
    suggestions,
    totalPotentialMonthlySavings: totalPotentialSavings,
    totalPotentialYearlySavings: yearlyPotential,
    goalAccelerations: goals.map((g) => {
      const rem = Math.max(0, g.targetAmount - g.currentAmount);
      const currentRate = g.monthlyContribution || (totalPotentialSavings > 0 ? totalPotentialSavings * 0.5 : 2000);
      const acceleratedRate = currentRate + (totalPotentialSavings * 0.4);
      const normalMonths = currentRate > 0 ? Math.ceil(rem / currentRate) : 0;
      const acceleratedMonths = acceleratedRate > 0 ? Math.ceil(rem / acceleratedRate) : 0;
      return {
        goalId: g._id,
        goalName: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        normalMonths,
        acceleratedMonths,
        monthsSaved: Math.max(0, normalMonths - acceleratedMonths)
      };
    })
  };
};

/**
 * What-If Savings Simulator
 */
const simulateSavingsImpact = (currentSpendByCategory, reductions = {}, goals = []) => {
  let monthlySaved = 0;
  const breakdown = [];

  Object.entries(reductions).forEach(([category, cutPercentage]) => {
    const current = currentSpendByCategory[category] || 0;
    const cut = Math.round(current * (cutPercentage / 100));
    monthlySaved += cut;
    breakdown.push({
      category,
      currentSpend: current,
      cutPercentage,
      savingsAmount: cut,
      newSpend: current - cut
    });
  });

  const yearlySaved = monthlySaved * 12;

  const goalImpact = goals.map((g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const currentMonthlyDeposit = g.monthlyContribution || 2000;
    const newMonthlyDeposit = currentMonthlyDeposit + (monthlySaved * 0.5); // 50% of savings allocated
    const originalMonths = currentMonthlyDeposit > 0 ? Math.ceil(remaining / currentMonthlyDeposit) : 'N/A';
    const newMonths = newMonthlyDeposit > 0 ? Math.ceil(remaining / newMonthlyDeposit) : 'N/A';
    return {
      goalName: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      originalMonths,
      newMonths,
      timeSavedMonths: typeof originalMonths === 'number' && typeof newMonths === 'number'
        ? Math.max(0, originalMonths - newMonths)
        : 0
    };
  });

  return {
    monthlySaved,
    yearlySaved,
    breakdown,
    goalImpact
  };
};

/**
 * AI Financial Advisor Chat Assistant
 * Has smart offline heuristic financial knowledge base + Optional Gemini API integration
 */
const queryFinancialAdvisor = async (userPrompt, financialContext = {}) => {
  const prompt = userPrompt.toLowerCase().trim();
  const { currentMonthData, suggestions, goals, fiftyThirtyTwenty } = financialContext;

  // If GEMINI_API_KEY is configured in env, attempt calling Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are FinTrack AI, an expert certified financial advisor. Answer this user question in a friendly, crisp, actionable manner with specific financial metrics.
User question: "${userPrompt}"
Context:
- Current Monthly Income: ₹${financialContext.totalIncome || 0}
- Current Monthly Expenses: ₹${financialContext.totalExpense || 0}
- Net Savings: ₹${financialContext.netSavings || 0}
- Top Expense Categories: ${JSON.stringify(financialContext.topCategories || {})}
- Active Savings Goals: ${JSON.stringify(goals || [])}
- Identified Savings Potential: ₹${financialContext.potentialSavings || 0}
Provide clear bullet points and motivational guidance.`
                }
              ]
            }
          ]
        })
      });
      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          answer: data.candidates[0].content.parts[0].text,
          source: 'Gemini AI 1.5 Flash'
        };
      }
    } catch (e) {
      console.warn('[AI Engine] External Gemini call skipped, using local expert heuristic:', e.message);
    }
  }

  // Local Intelligent Financial Advisor Heuristic
  const inc = financialContext.totalIncome || 50000;
  const exp = financialContext.totalExpense || 32000;
  const sav = financialContext.netSavings || (inc - exp);
  const savRate = inc > 0 ? Math.round((sav / inc) * 100) : 0;

  if (prompt.includes('save') || prompt.includes('how to save') || prompt.includes('saving')) {
    return {
      answer: `### 🎯 Actionable Plan to Boost Your Savings

Based on your spending patterns:
1. **Target Discretionary Trimming**: Your top variable categories (Dining, Entertainment, Shopping) typically conceal 20–30% in easy trims. Cutting just 2 takeout orders a week saves **₹3,000 to ₹4,500/month**.
2. **Automate the 20% Rule**: With an income of ₹${inc.toLocaleString()}, set up an auto-debit of ₹${Math.round(inc * 0.2).toLocaleString()} to a dedicated high-yield savings or index mutual fund on salary day.
3. **Plug Micro-Spends**: Those frequent quick orders under ₹300 accumulate rapidly. Set a daily discretionary limit.
4. **Goal Connection**: Directing these savings straight to your active goals will accelerate completion by **2 to 4 months**!`,
      source: 'FinTrack Smart Financial Advisor'
    };
  }

  if (prompt.includes('food') || prompt.includes('dining') || prompt.includes('swiggy') || prompt.includes('zomato')) {
    return {
      answer: `### 🥗 Food & Dining Spending Analysis

- **Insight**: Dining out and app food orders carry high convenience charges (delivery, taxes, tip, platform fee) adding up to ~35% over the raw food cost.
- **Smart Strategy**:
  1. Reserve food delivery strictly for weekends or special gatherings.
  2. Prepare meal ingredients over the weekend to eliminate weekday fatigue ordering.
  3. Keep easy-to-cook healthy essentials in the freezer.
  4. Setting a monthly dining budget of **₹${Math.round(exp * 0.15).toLocaleString()}** will keep your finances healthy!`,
      source: 'FinTrack Smart Financial Advisor'
    };
  }

  if (prompt.includes('budget') || prompt.includes('50/30/20') || prompt.includes('allocate')) {
    return {
      answer: `### 📊 Your Ideal 50/30/20 Budget Breakdown

For your current monthly income of **₹${inc.toLocaleString()}**:
- 🏠 **Needs (50%)**: **₹${Math.round(inc * 0.50).toLocaleString()}** (Rent, groceries, utilities, loan EMIs, basic commute)
- 🎉 **Wants (30%)**: **₹${Math.round(inc * 0.30).toLocaleString()}** (Dining, weekend outings, shopping, streaming subscriptions)
- 💰 **Savings & Investments (20%)**: **₹${Math.round(inc * 0.20).toLocaleString()}** (Emergency fund, goals, retirement, stocks)

*Pro-tip: If your Needs exceed 50%, trim from the "Wants" column first rather than reducing your Savings!*`,
      source: 'FinTrack Smart Financial Advisor'
    };
  }

  if (prompt.includes('goal') || prompt.includes('emergency fund') || prompt.includes('target')) {
    const goalsCount = goals ? goals.length : 0;
    return {
      answer: `### 🏆 Goal Acceleration Roadmap

You currently have **${goalsCount}** active goals.
1. **Emergency Fund First**: Maintain 3 to 6 months of mandatory living expenses (approx. ₹${Math.round(exp * 3).toLocaleString()}) in a high-yield liquid fund before aggressive luxury allocations.
2. **Lump-Sum Boosts**: Channel any bonuses, cashbacks, or tax refunds 100% into your highest-priority milestone.
3. **Progress Momentum**: Even a modest bump of ₹1,500/month cuts months off your timeline through compound consistency!`,
      source: 'FinTrack Smart Financial Advisor'
    };
  }

  // Default intelligent response
  return {
    answer: `### 💡 Financial Insight Summary

- **Financial Health Status**: Currently saving **₹${sav.toLocaleString()}** (${savRate}% savings rate) from an outflow of ₹${exp.toLocaleString()}.
- **Key Recommendation**: Review your **AI Savings Suggestions** tab to view quantified trimming opportunities tailored to your historical patterns.
- **Quick Win**: Set up category spending alerts at 85% threshold to eliminate end-of-month surprises.

Feel free to ask me:
* "How do I cut down food and delivery expenses?"
* "What is my ideal 50/30/20 budget breakdown?"
* "How can I reach my savings goals faster?"`,
    source: 'FinTrack Smart Financial Advisor'
  };
};

module.exports = {
  predictCategory,
  analyzeSpendingPatterns,
  generateSavingsSuggestions,
  simulateSavingsImpact,
  queryFinancialAdvisor,
  CATEGORY_RULES,
  DISCRETIONARY_CATEGORIES
};
