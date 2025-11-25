const User = require('../models/User');
const Report = require('../models/Report');
const bcrypt = require('bcryptjs');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const reportStats = await Report.getStats();
    const totalUsers = await User.count();
    const adminCount = await User.count({ role: 'admin' });
    const userCount = await User.count({ role: 'user' });

    const stats = {
      reports: {
        total: parseInt(reportStats.total),
        pending: parseInt(reportStats.pending),
        investigating: parseInt(reportStats.investigating),
        resolved: parseInt(reportStats.resolved),
        falsePositive: parseInt(reportStats.false_positive)
      },
      reportTypes: {
        phishing: parseInt(reportStats.phishing),
        spam: parseInt(reportStats.spam),
        malware: parseInt(reportStats.malware)
      },
      users: {
        total: totalUsers,
        admins: adminCount,
        regularUsers: userCount
      }
    };

    res.json({ stats });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reports with filters (Admin)
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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const filters = { role, department };
    
    const users = await User.findAll(filters);
    const total = await User.count(filters);

    res.json({
      users,
      total
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new user (Admin)
exports.addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: role || 'user',
      department: department || null
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    const deleted = await User.delete(userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.userId;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent users from changing their own role
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const updatedUser = await User.updateRole(userId, role);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ 
      message: 'User role updated successfully', 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk update reports
exports.bulkUpdateReports = async (req, res) => {
  try {
    const { reportIds, updates } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: 'Report IDs array is required' });
    }

    if (!updates || !updates.status) {
      return res.status(400).json({ message: 'Status update is required' });
    }

    const results = [];
    for (const reportId of reportIds) {
      try {
        const updated = await Report.updateStatus(reportId, updates.status, req.user.id);
        results.push({ id: reportId, success: true, report: updated });
      } catch (err) {
        results.push({ id: reportId, success: false, error: err.message });
      }
    }

    res.json({
      message: 'Bulk update completed',
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system health
exports.getSystemHealth = async (req, res) => {
  try {
    const db = require('../config/db');
    
    // Test database connection
    let dbStatus = 'healthy';
    try {
      await db.query('SELECT 1');
    } catch (err) {
      dbStatus = 'unhealthy';
    }

    const health = {
      status: dbStatus === 'healthy' ? 'operational' : 'degraded',
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    res.json({ health });
  } catch (err) {
    console.error('Get system health error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;
