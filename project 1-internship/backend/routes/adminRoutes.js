const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  toggleBanUser,
  adminDeleteResource,
  getReports,
  updateReportStatus,
  getAllResources,
  promoteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/ban/:id', toggleBanUser);
router.put('/promote/:id', promoteUser);
router.get('/resources', getAllResources);
router.delete('/resource/:id', adminDeleteResource);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);

module.exports = router;
