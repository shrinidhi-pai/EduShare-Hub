const User = require('../models/User');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -bookmarks');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const uploads = await Resource.find({ uploadedBy: req.params.id, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = await Resource.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          totalLikes: { $sum: { $size: '$likes' } },
        },
      },
    ]);

    res.json({
      success: true,
      user,
      uploads,
      stats: stats[0] || { totalUploads: 0, totalDownloads: 0, totalLikes: 0 },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
const getUserBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'uploadedBy', select: 'name avatar' },
    });

    res.json({ success: true, bookmarks: user.bookmarks || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Resource.aggregate([
      { $match: { uploadedBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          totalLikes: { $sum: { $size: '$likes' } },
        },
      },
    ]);

    const user = await User.findById(req.user._id);
    const bookmarkCount = user.bookmarks.length;

    // Uploads over time (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const monthlyUploads = await Resource.aggregate([
      { $match: { uploadedBy: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        ...(stats[0] || { totalUploads: 0, totalDownloads: 0, totalLikes: 0 }),
        bookmarkCount,
      },
      monthlyUploads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top contributors
// @route   GET /api/users/top-contributors
// @access  Public
const getTopContributors = async (req, res, next) => {
  try {
    const contributors = await Resource.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: '$uploadedBy',
          totalUploads: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
        },
      },
      { $sort: { totalUploads: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          avatar: '$user.avatar',
          department: '$user.department',
          totalUploads: 1,
          totalDownloads: 1,
        },
      },
    ]);

    res.json({ success: true, contributors });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, getUserBookmarks, getDashboardStats, getTopContributors };
