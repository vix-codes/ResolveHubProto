const express = require('express');
const router  = express.Router();

const { protect }        = require('../middleware/authMiddleware');
const { allowRoles }     = require('../middleware/roleMiddleware');
const { getTechnicians } = require('../controllers/userController');

// Admin needs this list to populate the "Assign technician" dropdown.
router.get('/technicians', protect, allowRoles('admin'), getTechnicians);

module.exports = router;
