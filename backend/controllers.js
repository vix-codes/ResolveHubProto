const User      = require('./models/User');
const Complaint = require('./models/Complaint');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { analyzeComplaint } = require('./utils/gemini');

// ── Auth ──────────────────────────────────────────────────────────────────

// Token embeds { id, role, name, email } so route handlers don't need extra DB lookups
const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role: role || 'tenant' });

    res.status(201).json({
      token: makeToken(user),
      user:  { id: user._id, name, email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: makeToken(user),
      user:  { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    res.json(await User.findById(req.user.id).select('-password'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Complaints ─────────────────────────────────────────────────────────────
// Flow: Tenant submits → AI detects category + priority (Pending)
//       Admin assigns technician → status becomes Assigned
//       Technician marks In Progress / Resolved, adds resolution notes

const createComplaint = async (req, res) => {
  const { title, description } = req.body;
  try {
    const ai = await analyzeComplaint(title, description);
    const complaint = await Complaint.create({
      title, description,
      category: ai.category,
      priority: ai.priority,
      tenant:   req.user.id,
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    res.json(
      await Complaint.find({ tenant: req.user.id })
        .populate('assignedTechnician', 'name email')
        .sort({ createdAt: -1 })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    res.json(
      await Complaint.find()
        .populate('tenant',             'name email')
        .populate('assignedTechnician', 'name email')
        .sort({ createdAt: -1 })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignTechnician = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTechnician: req.body.technicianId, status: 'Assigned' },
      { new: true }
    ).populate('tenant', 'name email').populate('assignedTechnician', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePriority = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true }
    ).populate('tenant', 'name email').populate('assignedTechnician', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignedComplaints = async (req, res) => {
  try {
    res.json(
      await Complaint.find({ assignedTechnician: req.user.id })
        .populate('tenant', 'name email')
        .sort({ createdAt: -1 })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { status, resolutionNotes } = req.body;
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNotes },
      { new: true }
    ).populate('tenant', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin ──────────────────────────────────────────────────────────────────

const getTechnicians = async (_req, res) => {
  try {
    res.json(await User.find({ role: 'technician' }).select('name email'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnalytics = async (_req, res) => {
  try {
    const total      = await Complaint.countDocuments();
    const byStatus   = await Complaint.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const byCategory = await Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const byPriority = await Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Complaint.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({ total, byStatus, byCategory, byPriority, recentCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register, login, getMe,
  createComplaint, getMyComplaints, getAllComplaints,
  assignTechnician, updatePriority, getAssignedComplaints, updateStatus,
  getTechnicians, getAnalytics,
};
