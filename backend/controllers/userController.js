const User = require('../models/User');

// ADMIN: Get list of all technicians to show in assign dropdown
const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('name email');
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTechnicians };
