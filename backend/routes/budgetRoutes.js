const express = require('express');
const router = express.Router();
const {
  getBudgetForMonth,
  setBudget,
  getAllBudgets
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAllBudgets)
  .post(setBudget);

router.get('/month/:month', getBudgetForMonth);

module.exports = router;
