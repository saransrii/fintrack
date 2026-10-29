const express = require('express');
const router = express.Router();
const {
  getAIInsights,
  runSavingsSimulator,
  chatWithAdvisor
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/insights', getAIInsights);
router.post('/simulate', runSavingsSimulator);
router.post('/chat', chatWithAdvisor);

module.exports = router;
