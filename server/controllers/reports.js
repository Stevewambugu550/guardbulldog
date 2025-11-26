const { validationResult } = require('express-validator');
const Report = require('../models/Report');

// Submit a new phishing report
exports.submitReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { emailSubject, senderEmail, emailBody, reportType, suspiciousLinks } = req.body;
    
    const report = await Report.create({
      reportedBy: req.user.id,
      emailSubject,
      senderEmail,
      emailBody,
      reportType,
      suspiciousLinks: suspiciousLinks || null,
      attachments: req.files ? JSON.stringify(req.files.map(f => f.filename)) : null
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (err) {
    console.error('Submit report error:', err);
    res.status(500).json({ message: 'Server error while submitting report' });
  }
};

// Get user's own reports
exports.getUserReports = async (req, res) => {
  try {
    const { status, reportType, limit = 50 } = req.query;
    
    const filters = { status, reportType, limit: parseInt(limit) };
    const reports = await Report.findByUserId(req.user.id, filters);

    res.json({ reports, count: reports.length });
  } catch (err) {
    console.error('Get user reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user owns the report or is admin
    if (report.reportedBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get notes if admin
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      const notes = await Report.getNotes(report.id);
      report.notes = notes;
    }

    res.json({ report });
  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update report status (Admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'investigating', 'confirmed', 'resolved', 'false_positive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const report = await Report.updateStatus(req.params.id, status, req.user.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report status updated', report });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add admin note to report
exports.addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note || note.trim() === '') {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const newNote = await Report.addNote(req.params.id, note, req.user.id);
    res.status(201).json({ message: 'Note added successfully', note: newNote });
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trending threats
exports.getTrendingThreats = async (req, res) => {
  try {
    const trending = await Report.getTrending(10);
    res.json({ threats: trending });
  } catch (err) {
    console.error('Get trending error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reports (Admin only)
exports.getAllReports = async (req, res) => {
  try {
    const { status, reportType, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    const filters = {
      status,
      reportType,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const reports = await Report.findAll(filters);
    const total = await Report.count({ status, reportType });

    res.json({
      reports,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + reports.length) < total
      }
    });
  } catch (err) {
    console.error('Get all reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get report statistics
exports.getReportStats = async (req, res) => {
  try {
    const stats = await Report.getStats();
    res.json({ stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
