require('dotenv').config({ path: '../../.env' });
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    // Verify JWT token
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ msg: 'No token provided' }) };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decoded.user.role;

    // Get overall statistics
    const totalReportsResult = await db.query('SELECT COUNT(*) as count FROM reports');
    const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const pendingReportsResult = await db.query("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'");
    const criticalReportsResult = await db.query("SELECT COUNT(*) as count FROM reports WHERE severity = 'critical'");
    const resolvedReportsResult = await db.query("SELECT COUNT(*) as count FROM reports WHERE status = 'resolved'");
    
    // Get category breakdown
    const categoryBreakdownResult = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM reports 
      GROUP BY category
    `);
    
    // Get recent reports
    const recentReportsResult = await db.query(`
      SELECT r.*, u.name as user_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    // Get trending threats (most common categories)
    const trendingThreatsResult = await db.query(`
      SELECT category, COUNT(*) as count, MAX(severity) as max_severity
      FROM reports
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalReports: parseInt(totalReportsResult.rows[0].count),
        totalUsers: parseInt(totalUsersResult.rows[0].count),
        pendingReports: parseInt(pendingReportsResult.rows[0].count),
        criticalReports: parseInt(criticalReportsResult.rows[0].count),
        resolvedReports: parseInt(resolvedReportsResult.rows[0].count),
        categoryBreakdown: categoryBreakdownResult.rows,
        recentReports: recentReportsResult.rows,
        trendingThreats: trendingThreatsResult.rows,
      }),
    };
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: 'Server error fetching dashboard stats' }),
    };
  }
};
