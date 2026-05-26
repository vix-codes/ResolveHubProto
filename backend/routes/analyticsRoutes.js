const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/', protect, allowRoles('admin'), getAnalytics);

module.exports = router;
