require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const { protect, allowRoles } = require('./middleware');
const {
  register, login, getMe,
  createComplaint, getMyComplaints, getAllComplaints,
  assignTechnician, updatePriority, getAssignedComplaints, updateStatus,
  getTechnicians, getAnalytics,
} = require('./controllers');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => { console.error(err); process.exit(1); });

const app = express();
app.use(cors());
app.use(express.json());

// Auth
app.post('/api/auth/register', register);
app.post('/api/auth/login',    login);
app.get('/api/auth/me',        protect, getMe);

// Complaints
// /my and /assigned must come before /:id — otherwise Express tries to match
// the literal strings "my" / "assigned" as MongoDB ObjectIDs and misses them
app.post('/api/complaints',                protect, allowRoles('tenant'),      createComplaint);
app.get('/api/complaints/my',              protect, allowRoles('tenant'),      getMyComplaints);
app.get('/api/complaints/assigned',        protect, allowRoles('technician'),  getAssignedComplaints);
app.put('/api/complaints/:id/status',      protect, allowRoles('technician'),  updateStatus);
app.get('/api/complaints',                 protect, allowRoles('admin'),       getAllComplaints);
app.put('/api/complaints/:id/assign',      protect, allowRoles('admin'),       assignTechnician);
app.put('/api/complaints/:id/priority',    protect, allowRoles('admin'),       updatePriority);

// Admin
app.get('/api/users/technicians', protect, allowRoles('admin'), getTechnicians);
app.get('/api/analytics',         protect, allowRoles('admin'), getAnalytics);

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
