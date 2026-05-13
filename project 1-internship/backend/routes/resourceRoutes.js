const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', getResources);
router.get('/my-uploads', protect, getMyUploads);
router.get('/tags', getTrendingTags);
router.get('/:id', getResourceById);

router.post(
  '/upload',
  protect,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  uploadResource
);

router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.post('/:id/rate', protect, rateResource);
router.post('/:id/download', incrementDownload);
router.post('/:id/report', protect, reportResource);

module.exports = router;
