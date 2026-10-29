const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getInteractiveChartsData,
  getMonthlyReport
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/charts', getInteractiveChartsData);
router.get('/report/:month', getMonthlyReport);

module.exports = router;
