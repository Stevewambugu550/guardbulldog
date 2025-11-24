const express = require('express');
const router = express.Router();
const educationController = require('../controllers/education');
const auth = require('../middleware/auth');

// @route   GET /api/education/modules
// @desc    Get all education modules
// @access  Private
router.get('/modules', auth, educationController.getModules);

// @route   GET /api/education/modules/:id
// @desc    Get single module
// @access  Private
router.get('/modules/:id', auth, educationController.getModuleById);

// @route   POST /api/education/modules/:id/quiz
// @desc    Submit quiz answers
// @access  Private
router.post('/modules/:id/quiz', auth, educationController.submitQuiz);

// @route   GET /api/education/progress
// @desc    Get user progress
// @access  Private
router.get('/progress', auth, educationController.getUserProgress);

module.exports = router;
