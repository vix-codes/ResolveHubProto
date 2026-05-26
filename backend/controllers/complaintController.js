// All complaint-related actions in one place.
//
// The flow:
//   1. Tenant submits → Gemini detects category + priority → status = Pending
//   2. Admin assigns a technician → status auto-changes to Assigned
//   3. Technician marks In Progress or Resolved, adds resolution notes
//   4. Tenant can see the full trail on their complaints page

const Complaint        = require('../models/Complaint');
const { analyzeComplaint } = require('../utils/gemini');

// TENANT: submit a new complaint
const createComplaint = async (req, res) => {
  const { title, description } = req.body;
  try {
    // Run AI analysis first — if it fails, it returns safe defaults (Other / Low)
    const ai = await analyzeComplaint(title, description);

    const complaint = await Complaint.create({
      title,
      description,
      category: ai.category,
      priority: ai.priority,
      tenant:   req.user.id,
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TENANT: get only their own complaints, newest first
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ tenant: req.user.id })
      .populate('assignedTechnician', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: get every complaint in the system
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('tenant',             'name email')
      .populate('assignedTechnician', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: assign a technician — status automatically becomes "Assigned"
const assignTechnician = async (req, res) => {
  const { technicianId } = req.body;
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTechnician: technicianId, status: 'Assigned' },
      { new: true }
    )
      .populate('tenant',             'name email')
      .populate('assignedTechnician', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: override the AI-detected priority
const updatePriority = async (req, res) => {
  const { priority } = req.body;
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    )
      .populate('tenant',             'name email')
      .populate('assignedTechnician', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TECHNICIAN: get only the complaints assigned to them
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTechnician: req.user.id })
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TECHNICIAN: update status (In Progress / Resolved) and save resolution notes
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

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignTechnician,
  updatePriority,
  getAssignedComplaints,
  updateStatus,
};
