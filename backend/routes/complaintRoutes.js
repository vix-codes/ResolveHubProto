// NOTE: /my and /assigned must come before /:id routes.
// If they were after, Express would try to match the literal strings
// "my" and "assigned" as MongoDB ObjectIDs and the routes would never hit.

const express = require('express');
const router  = express.Router();

const { protect }    = require('../middleware/authMiddleware');
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

router.post('/',            protect, allowRoles('tenant'),      createComplaint);
router.get('/my',           protect, allowRoles('tenant'),      getMyComplaints);
router.get('/assigned',     protect, allowRoles('technician'),  getAssignedComplaints);
router.put('/:id/status',   protect, allowRoles('technician'),  updateStatus);
router.get('/',             protect, allowRoles('admin'),       getAllComplaints);
router.put('/:id/assign',   protect, allowRoles('admin'),       assignTechnician);
router.put('/:id/priority', protect, allowRoles('admin'),       updatePriority);

module.exports = router;
