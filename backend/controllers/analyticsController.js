// Aggregated stats for the admin analytics page.
// MongoDB's $group pipeline does the counting on the DB side — much faster
// than pulling all documents into Node and counting manually.

const Complaint = require('../models/Complaint');

const getAnalytics = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    const byStatus   = await Complaint.aggregate([
      { $group: { _id: '$status',   count: { $sum: 1 } } },
      { $sort:  { _id: 1 } },
    ]);
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]);
    const byPriority = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Complaints submitted in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Complaint.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({ total, byStatus, byCategory, byPriority, recentCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnalytics };
