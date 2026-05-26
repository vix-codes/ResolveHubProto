const Complaint = require('../models/Complaint');

// ADMIN: Aggregated stats for the analytics dashboard
const getAnalytics = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    // Count complaints grouped by status
    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Count complaints grouped by category
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Count complaints grouped by priority
    const byPriority = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // How many complaints were submitted in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Complaint.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      total,
      byStatus,
      byCategory,
      byPriority,
      recentCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnalytics };
