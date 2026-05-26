// Only one endpoint here — fetching all technicians so the admin
// can populate the "Assign technician" dropdown on the complaints page.

const User = require('../models/User');

const getTechnicians = async (_req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('name email');
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTechnicians };
