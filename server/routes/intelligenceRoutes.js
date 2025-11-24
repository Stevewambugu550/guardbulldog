const express = require('express');
const router = express.Router();
const ipController = require('../controllers/ipIntelligenceController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

/**
 * IP Intelligence Routes
 * Endpoints for IP analysis, reputation, and threat intelligence
 */

// Public routes - Basic IP lookup
router.get('/ip/:address', ipController.analyzeIP);
router.get('/ip/:address/reputation', ipController.getIPReputation);

// Admin routes - Threat intelligence and management
router.get('/threats', authenticateToken, ipController.getThreatIntelligence);
router.get('/threats/geographic', authenticateToken, ipController.getGeographicThreats);
router.put('/ip/:address/reputation', authenticateToken, isAdmin, ipController.updateIPReputation);

module.exports = router;
