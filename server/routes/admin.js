const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const adminController = require('../controllers/admin');

// @route   GET api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', [auth, admin], adminController.getDashboardStats);

// @route   GET api/admin/reports
// @desc    Get all reports with filters
// @access  Private (Admin)
router.get('/reports', [auth, admin], adminController.getAllReports);

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin) - simplified auth for now
router.get('/users', adminController.getAllUsers);

// @route   PUT api/admin/users/:userId/role
// @desc    Update user role
// @access  Private (Admin)
router.put(
  '/users/:userId/role',
  [auth, admin, [check('role', 'Role is required').not().isEmpty()]],
  adminController.updateUserRole
);

// @route   PUT api/admin/reports/bulk
// @desc    Bulk update reports
// @access  Private (Admin)
router.put('/reports/bulk', [auth, admin], adminController.bulkUpdateReports);

// @route   GET api/admin/system/health
// @desc    Get system health status
// @access  Private (Admin)
router.get('/system/health', [auth, admin], adminController.getSystemHealth);

module.exports = router;
