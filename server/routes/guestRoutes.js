const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

/**
 * Guest Routes - Public and Admin endpoints for guest reporting
 */

// Public routes - No authentication required
router.post('/submit', guestController.submitGuestReport);
router.get('/track/:token', guestController.trackReport);

// Admin routes - Authentication required
router.get('/all', authenticateToken, isAdmin, guestController.getAllGuestReports);
router.put('/:id/status', authenticateToken, isAdmin, guestController.updateGuestReportStatus);

module.exports = router;
