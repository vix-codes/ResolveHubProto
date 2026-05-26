// Three kinds of users in this system:
//   tenant     — lives in the apartment, submits complaints
//   admin      — manages everything, assigns technicians
//   technician — handles and resolves the complaints

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // always stored as a bcrypt hash
  role:     { type: String, enum: ['tenant', 'admin', 'technician'], default: 'tenant' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
