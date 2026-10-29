const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  predictCategoryEndpoint,
  seedSampleData,
  exportTransactionsCSV
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.post('/predict-category', predictCategoryEndpoint);
router.post('/seed', seedSampleData);
router.get('/export/csv', exportTransactionsCSV);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
