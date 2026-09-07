const express = require('express');
const router = express.Router();
const {
  getSpendingAnalytics,
  chatAssistant,
  evaluatePurchase,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/analytics', getSpendingAnalytics);
router.post('/chat', chatAssistant);
router.post('/purchase-recommendation', evaluatePurchase);

module.exports = router;
