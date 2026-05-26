const Complaint = require('../models/Complaint');
const { analyzeComplaint } = require('../utils/gemini');

// TENANT: Submit a new complaint (AI auto-categorizes it)
const createComplaint = async (req, res) => {
  const { title, description } = req.body;

  try {
    // Ask Gemini to detect category and priority
    const aiResult = await analyzeComplaint(title, description);

    const complaint = await Complaint.create({
      title,
      description,
      category: aiResult.category,
      priority: aiResult.priority,
      tenant: req.user.id,
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TENANT: Get only their own complaints
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

// ADMIN: Get all complaints from all tenants
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('tenant', 'name email')
      .populate('assignedTechnician', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Assign a technician to a complaint, status changes to Assigned
const assignTechnician = async (req, res) => {
  const { technicianId } = req.body;

  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTechnician: technicianId, status: 'Assigned' },
      { new: true }
    )
      .populate('tenant', 'name email')
      .populate('assignedTechnician', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Manually change a complaint's priority
const updatePriority = async (req, res) => {
  const { priority } = req.body;

  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    )
      .populate('tenant', 'name email')
      .populate('assignedTechnician', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TECHNICIAN: Get complaints assigned to them
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

// TECHNICIAN: Update complaint status and add resolution notes
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
