const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

// @route   POST /api/inquiry
// @desc    Submit inquiry to admin
// @access  Private
router.post('/', auth, inquiryController.submitInquiry);

// @route   GET /api/inquiry/my
// @desc    Get user's inquiries
// @access  Private
router.get('/my', auth, inquiryController.getUserInquiries);

// @route   GET /api/inquiry/all
// @desc    Get all inquiries (admin only)
// @access  Private/Admin
router.get('/all', auth, isAdmin, inquiryController.getAllInquiries);

// @route   POST /api/inquiry/:id/respond
// @desc    Respond to inquiry (admin only)
// @access  Private/Admin
router.post('/:id/respond', auth, isAdmin, inquiryController.respondToInquiry);

module.exports = router;
