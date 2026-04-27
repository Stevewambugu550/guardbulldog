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

    // Get recent activity (audit logs)
    let sql;
    if (userRole === 'admin' || userRole === 'super_admin') {
      sql = `
        SELECT a.*, u.name as user_name, u.email as user_email
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 20
      `;
    } else {
      sql = `
        SELECT a.*, u.name as user_name, u.email as user_email
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
        LIMIT 10
      `;
    }

    const params = (userRole === 'admin' || userRole === 'super_admin') ? [] : [decoded.user.id];
    const result = await db.query(sql, params);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: 'Server Error' }),
    };
  }
};

exports.handler = authenticate(getRecentActivity);
