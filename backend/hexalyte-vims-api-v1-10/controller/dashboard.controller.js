const dashboardService = require('../service/dashboard.service');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

/**
 * Get comprehensive dashboard statistics
 * @route GET /dashboard/stats
 * @returns {Object} Dashboard statistics including revenue, orders, customers, inventory
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  
  return res.status(httpStatus.OK).send({
    status: 'success',
    data: stats
  });
});

module.exports = {
  getDashboardStats
};
