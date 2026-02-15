const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/dashboard.controller');
const { auth } = require('../../middleware/auth');

/**
 * @route GET /dashboard/stats
 * @description Get comprehensive dashboard statistics
 * @access Private (requires authentication)
 */
router
  .route('/stats')
  .get(auth(), dashboardController.getDashboardStats);

module.exports = router;
