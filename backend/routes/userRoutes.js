const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { getTechnicians } = require('../controllers/userController');

router.get('/technicians', protect, allowRoles('admin'), getTechnicians);

module.exports = router;
