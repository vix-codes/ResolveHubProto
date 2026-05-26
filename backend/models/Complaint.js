// The main model of the app.
//
// Status lifecycle:  Pending → Assigned → In Progress → Resolved
//
// When a tenant submits, Gemini AI fills in category and priority automatically.
// Admin can override priority. Technician adds resolution notes when done.

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },

  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Cleaning', 'Internet', 'Security', 'Other'],
    default: 'Other',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Pending',
  },

  tenant:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNotes:    { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
