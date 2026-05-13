const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const Report = require('../models/Report');
const User = require('../models/User');
const path = require('path');

// @desc    Get all resources with search, filter, pagination
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = { isApproved: true };

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filters
    if (req.query.subject) query.subject = { $regex: req.query.subject, $options: 'i' };
    if (req.query.semester) query.semester = req.query.semester;
    if (req.query.department) query.department = { $regex: req.query.department, $options: 'i' };
    if (req.query.resourceType) query.resourceType = req.query.resourceType;
    if (req.query.tags) query.tags = { $in: req.query.tags.split(',') };

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort === 'downloads') sort = { downloads: -1 };
    if (req.query.sort === 'likes') sort = { 'likes': -1 };
    if (req.query.sort === 'rating') sort = { averageRating: -1 };
    if (req.query.sort === 'oldest') sort = { createdAt: 1 };

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name avatar department')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      resources,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'uploadedBy',
      'name avatar department bio'
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Get comments
    const comments = await Comment.find({ resource: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Related resources (same subject, exclude current)
    const related = await Resource.find({
      subject: resource.subject,
      _id: { $ne: resource._id },
      isApproved: true,
    })
      .populate('uploadedBy', 'name avatar')
      .limit(4);

    res.json({ success: true, resource, comments, related });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new resource
// @route   POST /api/resources/upload
// @access  Private
const uploadResource = async (req, res, next) => {
  try {
    const { title, description, subject, semester, department, tags, resourceType, externalLink } = req.body;

    if (!title || !description || !subject || !semester || !department || !resourceType) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    let fileUrl = '';
    let thumbnail = '';
    let fileSize = '';
    let originalFileName = '';

    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        const file = req.files.file[0];
        const mime = file.mimetype;
        let subfolder = 'documents';
        if (mime === 'application/pdf') subfolder = 'pdfs';
        else if (mime.startsWith('image/')) subfolder = 'images';
        fileUrl = `/uploads/${subfolder}/${file.filename}`;
        fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        originalFileName = file.originalname;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnail = `/uploads/images/${req.files.thumbnail[0].filename}`;
      }
    }

    const tagsArray = tags ? tags.split(',').map((t) => t.trim().toLowerCase()) : [];

    const resource = await Resource.create({
      title,
      description,
      subject,
      semester,
      department,
      tags: tagsArray,
      resourceType,
      fileUrl: fileUrl || externalLink || '',
      externalLink: externalLink || '',
      thumbnail,
      fileSize,
      originalFileName,
      uploadedBy: req.user._id,
    });

    await resource.populate('uploadedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this resource' });
    }

    const { title, description, subject, semester, department, tags, resourceType } = req.body;

    if (title) resource.title = title;
    if (description) resource.description = description;
    if (subject) resource.subject = subject;
    if (semester) resource.semester = semester;
    if (department) resource.department = department;
    if (tags) resource.tags = tags.split(',').map((t) => t.trim().toLowerCase());
    if (resourceType) resource.resourceType = resourceType;

    await resource.save();

    res.json({ success: true, message: 'Resource updated successfully', resource });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    // Delete related comments and bookmarks
    await Comment.deleteMany({ resource: resource._id });
    await Bookmark.deleteMany({ resource: resource._id });

    await Resource.deleteOne({ _id: resource._id });

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike resource
// @route   POST /api/resources/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const likedIndex = resource.likes.indexOf(req.user._id);
    let liked;

    if (likedIndex === -1) {
      resource.likes.push(req.user._id);
      liked = true;
    } else {
      resource.likes.splice(likedIndex, 1);
      liked = false;
    }

    await resource.save();
    res.json({ success: true, liked, likesCount: resource.likes.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark/Unbookmark resource
// @route   POST /api/resources/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const user = await User.findById(req.user._id);
    const bookmarkIndex = user.bookmarks.indexOf(req.params.id);
    let bookmarked;

    if (bookmarkIndex === -1) {
      user.bookmarks.push(req.params.id);
      bookmarked = true;
    } else {
      user.bookmarks.splice(bookmarkIndex, 1);
      bookmarked = false;
    }

    await user.save();
    res.json({ success: true, bookmarked });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to resource
// @route   POST /api/resources/:id/comment
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      resource: req.params.id,
      text,
    });

    await comment.populate('user', 'name avatar');

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/resources/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.deleteOne({ _id: comment._id });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate resource
// @route   POST /api/resources/:id/rate
// @access  Private
const rateResource = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const existingRating = resource.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.value = value;
    } else {
      resource.ratings.push({ user: req.user._id, value });
    }

    resource.calculateAverageRating();
    await resource.save();

    res.json({ success: true, averageRating: resource.averageRating, ratingsCount: resource.ratings.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Public
const incrementDownload = async (req, res, next) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.json({ success: true, message: 'Download tracked' });
  } catch (error) {
    next(error);
  }
};

// @desc    Report resource
// @route   POST /api/resources/:id/report
// @access  Private
const reportResource = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }

    const existing = await Report.findOne({ resource: req.params.id, reportedBy: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reported this resource' });
    }

    await Report.create({ resource: req.params.id, reportedBy: req.user._id, reason, description });
    res.json({ success: true, message: 'Resource reported successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's uploaded resources
// @route   GET /api/resources/my-uploads
// @access  Private
const getMyUploads = async (req, res, next) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending tags
// @route   GET /api/resources/tags
// @access  Public
const getTrendingTags = async (req, res, next) => {
  try {
    const resources = await Resource.find({ isApproved: true }).select('tags');
    const tagCount = {};
    resources.forEach((r) => {
      r.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ success: true, tags: sorted });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  uploadResource,
  updateResource,
  deleteResource,
  toggleLike,
  toggleBookmark,
  addComment,
  deleteComment,
  rateResource,
  incrementDownload,
  reportResource,
  getMyUploads,
  getTrendingTags,
};
