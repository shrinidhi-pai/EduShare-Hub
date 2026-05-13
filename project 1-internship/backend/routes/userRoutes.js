const express = require('express');
const router = express.Router();
const { getUserProfile, getUserBookmarks, getDashboardStats, getTopContributors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/top-contributors', getTopContributors);
router.get('/bookmarks', protect, getUserBookmarks);
router.get('/dashboard', protect, getDashboardStats);
router.get('/:id', getUserProfile);

module.exports = router;
