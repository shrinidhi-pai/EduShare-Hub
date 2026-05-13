const User = require('../models/User');
const Resource = require('../models/Resource');
const Report = require('../models/Report');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalResources, totalDownloads, totalReports, pendingReports] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Resource.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Most downloaded by subject
    const topSubjects = await Resource.aggregate([
      { $group: { _id: '$subject', downloads: { $sum: '$downloads' }, count: { $sum: 1 } } },
      { $sort: { downloads: -1 } },
      { $limit: 5 },
    ]);

    // Resources by type
    const resourcesByType = await Resource.aggregate([
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
    ]);

    // New users last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newResourcesThisMonth = await Resource.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalResources,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalReports,
        pendingReports,
        newUsersThisMonth,
        newResourcesThisMonth,
        topSubjects,
        resourcesByType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.role) query.role = req.query.role;
    if (req.query.banned === 'true') query.isBanned = true;

    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ success: true, users, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/ban/:id
// @access  Admin
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an admin user' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      isBanned: user.isBanned,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource (Admin)
// @route   DELETE /api/admin/resource/:id
// @access  Admin
const adminDeleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await Comment.deleteMany({ resource: resource._id });
    await Bookmark.deleteMany({ resource: resource._id });
    await Report.deleteMany({ resource: resource._id });
    await Resource.deleteOne({ _id: resource._id });

    res.json({ success: true, message: 'Resource deleted by admin' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Admin
const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) query.status = req.query.status;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('resource', 'title subject')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, reports, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Admin
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report status updated', report });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resources (admin view)
// @route   GET /api/admin/resources
// @access  Admin
const getAllResources = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Resource.countDocuments();
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, resources, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote user to admin
// @route   PUT /api/admin/promote/:id
// @access  Admin
const promoteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.role = user.role === 'admin' ? 'student' : 'admin';
    await user.save();
    res.json({ success: true, message: `User role updated to ${user.role}`, role: user.role });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getAllUsers,
  toggleBanUser,
  adminDeleteResource,
  getReports,
  updateReportStatus,
  getAllResources,
  promoteUser,
};
