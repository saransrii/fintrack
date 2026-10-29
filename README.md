# FinTrack – Intelligent Expense Analytics Platform 💰

> An AI-based Personal Finance Management System built on the MERN stack (MongoDB, Express, React, Node.js) featuring intelligent pattern recognition, automated categorization, monthly budget planning with alerts, milestone savings tracking, and historical-pattern-derived savings recommendations.

---

## 🌟 Highlights & Key Features

### 1. 💵 Income & Expense Management
- Record daily cash inflows and outflows with detailed parameters (amount, category, payment channel, date, notes, recurring flag, custom tags).
- **Instant AI Auto-Categorization**: As you type descriptions (e.g. *"Swiggy dinner"*, *"Shell petrol"*, *"Netflix"*, *"Salary"*), the built-in AI NLP engine detects the category, transaction type, and suggests appropriate tags in real-time.
- Advanced filtering by transaction type (Income / Expense), category, payment method (UPI, Credit Card, Debit Card, Net Banking, Cash), and date range.
- One-click CSV ledger export for spreadsheet accounting.

### 2. 📊 Monthly Budget Planning & Overspend Protection
- Set a total monthly budget cap and allocate individual spending thresholds per category.
- Color-coded real-time visual progress bars:
  - 🟢 **Safe Zone (<85%)**: Spending comfortably within limits.
  - 🟡 **Warning Zone (85%–99%)**: Proactive alert notifying that budget cap is nearing.
  - 🔴 **Danger Zone (≥100%)**: Visual alert banner for immediate intervention.
- Configurable alert threshold percentage.

### 3. 🎯 Milestone Savings Goal Tracking
- Define dedicated capital buckets (e.g. *Emergency Fund (6 Months)*, *MacBook Pro M3*, *Bali Vacation Trip*).
- Dynamic progress calculation with target date countdown and **recommended monthly deposit calculation** to stay on schedule.
- Quick **+ Add Contribution** modal with full contribution history logs.
- Interactive celebration states when goals are achieved!

### 4. 📈 Interactive Analytics & Visual Charts
- **Income vs. Expense Bar Chart**: Visual comparison across 3, 6, or 12 months.
- **Categorization Donut Chart**: Clear percentage distribution of discretionary and essential expenses.
- **Net Monthly Savings Trajectory**: Smooth area trend lines tracking capital accumulation.
- **Payment Channel Breakdown**: Distribution between UPI, Credit Cards, Debit Cards, and Net Banking.

### 5. 📑 Monthly Statements & Financial Health Reports
- Formal financial statements generated for any selected month.
- **Budget Adherence Score (0–100)** evaluating savings discipline and budget compliance.
- Breakdown of primary spending drivers, daily burn rate, and itemized transaction records.
- **Print / PDF Export**: Clean, printable format ready for archiving.

### 6. 🧠 AI Spending Insights & Pattern-Derived Savings Suggestions
*(Special Feature: "Previous spending patterns based on savings suggestions")*
- **Historical Velocity Analysis**: Evaluates spending patterns across past months to detect:
  - Month-over-Month (MoM) category drift (e.g., Food & Dining up 28% vs previous month).
  - High-frequency micro-spending leakages (e.g., 15 small spends under ₹300 accumulating to ₹4,500+).
  - Weekend spending skew (e.g., 52% of discretionary expenses occurring Friday–Sunday).
  - Repeating recurring charges and streaming subscription audits.
  - **50/30/20 Rule Benchmark**: Evaluates Needs (50%), Wants (30%), and Savings (20%).
- **Quantified Savings Suggestions**: Automatically calculates actionable, prioritized tips directly from past deviations:
  - E.g., *"Reducing takeout dining by 25% frees up ₹3,625/mo, accelerating your Emergency Fund goal by 2.4 months!"*
- **Interactive "What-If" Savings Simulator**:
  - Drag interactive sliders on discretionary categories to immediately see projected monthly and yearly capital generation.
- **FinTrack AI Financial Advisor Chat**:
  - Interactive financial chatbot equipped with expert heuristic finance knowledge and optional Google Gemini AI integration.

---

## 🏗️ Technology Architecture

```
mern2project/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB connector with auto-launch fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile, and 1-click Demo Guest mode
│   │   ├── transactionController.js # CRUD, AI category prediction, CSV export, demo seeder
│   │   ├── budgetController.js   # Monthly budget caps, category limits, utilization alerts
│   │   ├── goalController.js     # Milestone goals, deposit tracking, time remaining
│   │   ├── analyticsController.js# Dashboard KPIs, chart aggregation, monthly reports
│   │   └── aiController.js       # Pattern detection, savings suggestions, What-If simulator, AI chat
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT Bearer token authentication
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Budget.js
│   │   └── Goal.js
│   ├── routes/                   # Clean Express REST endpoints
│   ├── services/
│   │   └── aiEngine.js           # Core AI pattern detection, savings suggestion algorithms & advisor
│   ├── utils/
│   │   └── seedData.js           # Realistic 3-month demo data generator
│   ├── .env                      # Environment configuration
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios client with interceptors
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar
│   │   │   ├── dashboard/        # DashboardView with KPI stat cards
│   │   │   ├── transactions/     # TransactionsView, AddTransactionModal
│   │   │   ├── budgets/          # BudgetsView, BudgetModal
│   │   │   ├── goals/            # GoalsView, AddGoalModal, ContributeGoalModal
│   │   │   ├── analytics/        # AnalyticsView with Chart.js
│   │   │   ├── reports/          # ReportsView with adherence score & printable layout
│   │   │   ├── ai-insights/      # AIInsightsView with pattern analyzer, suggestions & chat
│   │   │   └── auth/             # AuthModal with 1-click Demo mode
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth provider
│   │   │   └── CurrencyContext.jsx # Multi-currency state (₹ INR, $ USD, € EUR, £ GBP)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind CSS & custom animations
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── package.json                  # Root orchestration scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher (tested on Node v24)
- **MongoDB**: Local MongoDB community server (installed on `localhost:27017`) or a free MongoDB Atlas connection string.

---

### Step 1: Clone & Install Dependencies

From the project root (`mern2project`):

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install them individually:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 2: Environment Configuration

Backend configuration file: `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fintrack
JWT_SECRET=fintrack_super_secret_jwt_key_2026_xyz
# Optional: Provide Google Gemini API Key for extended external LLM chat
GEMINI_API_KEY=
```

*(Note: The AI engine works seamlessly offline with rich heuristic financial pattern intelligence even without a Gemini API key!)*

---

### Step 3: Run the Application

You can run both backend and frontend servers in separate terminal tabs:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite will launch frontend on http://localhost:3000
```

Open your browser at **`http://localhost:3000`**.

---

### Step 4: Explore with Instant Demo Mode

1. Click **"Launch Instant Demo"** or **"Try Demo"** on the landing page or navigation bar.
2. The system automatically initializes the guest demo account pre-populated with **3 months of realistic spending transactions**, multiple budget plans, and 3 active savings goals (*Emergency Fund*, *MacBook Pro M3*, *Bali Vacation*).
3. Navigate to the **"AI Spending Insights"** tab to view your historical spending pattern analysis, personalized savings suggestions, What-If simulation calculations, and interact with the AI Financial Advisor!
4. Use the **"Load Demo Data"** button on the navbar anytime to refresh the dataset.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account with currency preference |
| `POST` | `/api/auth/login` | Sign in with email & password |
| `POST` | `/api/auth/guest` | 1-Click Guest Demo mode with instant data |
| `GET` | `/api/auth/me` | Fetch active user profile |
| `GET` | `/api/transactions` | Query transactions with filters, search, & pagination |
| `POST` | `/api/transactions` | Record new transaction |
| `POST` | `/api/transactions/predict-category` | AI category & tag auto-prediction from text |
| `POST` | `/api/transactions/seed` | Seed/re-populate 3-month sample transaction dataset |
| `GET` | `/api/transactions/export/csv` | Download complete transaction ledger as CSV |
| `GET` | `/api/budgets/month/:month` | Retrieve monthly budget, category status & overspend alerts |
| `POST` | `/api/budgets` | Create or update monthly budget plan |
| `GET` | `/api/goals` | List all savings goals with calculated target metrics |
| `POST` | `/api/goals` | Create a new savings goal |
| `POST` | `/api/goals/:id/contribute` | Deposit capital towards a savings goal |
| `GET` | `/api/analytics/dashboard` | Dashboard summary KPIs, recent activity & progress |
| `GET` | `/api/analytics/charts` | Chart datasets for multi-month trends & distributions |
| `GET` | `/api/analytics/report/:month` | Comprehensive financial audit statement & adherence score |
| `GET` | `/api/ai/insights` | Historical pattern analysis & quantified savings suggestions |
| `POST` | `/api/ai/simulate` | Interactive What-If discretionary trimming simulation |
| `POST` | `/api/ai/chat` | AI Financial Advisor interactive query assistant |

---

## 🔒 Security & Best Practices
- **Password Protection**: Passwords securely hashed with `bcryptjs` (salt rounds: 10).
- **JWT Authentication**: Protected REST endpoints using signed JSON Web Tokens.
- **Data Validation & Sanitization**: Strict input checks and Mongoose schema validations.
- **Responsive & Accessible UI**: Built with modern Tailwind CSS and Plus Jakarta Sans typography.
