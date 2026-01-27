const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

const verifyAdmin = (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guardbulldog-secret-key-2024');
    if (decoded.user && (decoded.user.role === 'admin' || decoded.user.role === 'super_admin')) {
      return decoded.user;
    }
    return null;
  } catch (err) {
    return null;
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  const admin = verifyAdmin(event);
  if (!admin) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized' }) };
  }

  try {
    // Get user stats
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Get report stats
    const reportsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
      FROM reports
    `);
    const reportStats = reportsResult.rows[0];

    // Get recent reports
    const recentReports = await pool.query(`
      SELECT r.id, r."trackingNumber", r.subject, r.status, r.severity, r."createdAt",
             u."firstName", u."lastName"
      FROM reports r
      LEFT JOIN users u ON r."reportedBy" = u.id
      ORDER BY r."createdAt" DESC
      LIMIT 5
    `);

    // Get recent users
    const recentUsers = await pool.query(`
      SELECT id, "firstName", "lastName", email, role, "createdAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        stats: {
          totalUsers,
          totalReports: parseInt(reportStats.total),
          pendingReports: parseInt(reportStats.pending),
          investigatingReports: parseInt(reportStats.investigating),
          confirmedReports: parseInt(reportStats.confirmed),
          resolvedReports: parseInt(reportStats.resolved)
        },
        recentReports: recentReports.rows,
        recentUsers: recentUsers.rows
      })
    };

  } catch (err) {
    console.error('Admin Stats Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
