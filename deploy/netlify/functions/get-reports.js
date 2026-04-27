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
    const userId = decoded.user.id;
    const userRole = decoded.user.role;

    // If admin or super_admin, return all reports. Otherwise, return only user's reports
    let sql;
    let params;

    if (userRole === 'admin' || userRole === 'super_admin') {
      sql = `
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reports r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `;
      params = [];
    } else {
      sql = `
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reports r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [userId];
    }

    const result = await db.query(sql, params);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error('Get Reports Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: 'Server error fetching reports' }),
    };
  }
};
