const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  const admin = verifyAdmin(event);
  if (!admin) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized' }) };
  }

  try {
    // Extract report ID from path: /api/reports/{id}/status
    const pathParts = event.path.split('/');
    const reportId = pathParts[pathParts.length - 2];
    const { status } = JSON.parse(event.body);

    if (!reportId || isNaN(reportId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ msg: 'Invalid report ID' }) };
    }

    await pool.query(
      'UPDATE reports SET status = $1, "updatedAt" = NOW(), "reviewedBy" = $2, "reviewedAt" = NOW() WHERE id = $3',
      [status, admin.id, reportId]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ msg: 'Report status updated', status })
    };

  } catch (err) {
    console.error('Report Status Update Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
