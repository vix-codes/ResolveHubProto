const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignTechnician,
  updatePriority,
  getAssignedComplaints,
  updateStatus,
} = require('../controllers/complaintController');

// Tenant routes
router.post('/', protect, allowRoles('tenant'), createComplaint);
router.get('/my', protect, allowRoles('tenant'), getMyComplaints);

// Technician routes — must come before /:id routes to avoid collision
router.get('/assigned', protect, allowRoles('technician'), getAssignedComplaints);
router.put('/:id/status', protect, allowRoles('technician'), updateStatus);

// Admin routes
router.get('/', protect, allowRoles('admin'), getAllComplaints);
router.put('/:id/assign', protect, allowRoles('admin'), assignTechnician);
router.put('/:id/priority', protect, allowRoles('admin'), updatePriority);

module.exports = router;
