const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getPendingPickups,
  getActiveReturns,
  processPickup,
  processReturn
} = require('../controllers/rentalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Staff and Admin routes
router.use(protect);
router.use(authorize('Staff', 'Admin'));

router.get('/', getAllRecords);
router.get('/pending-pickups', getPendingPickups);
router.get('/active-returns', getActiveReturns);
router.post('/pickup', processPickup);
router.post('/return', processReturn);

module.exports = router;
