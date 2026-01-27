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

const verifyToken = (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guardbulldog-secret-key-2024');
    return decoded.user;
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

  const user = verifyToken(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized' }) };
  }

  try {
    // Get reports for this user
    const result = await pool.query(`
      SELECT 
        id,
        "trackingNumber",
        "senderEmail",
        "senderName",
        subject,
        "emailBody",
        "reportType",
        severity,
        status,
        "createdAt",
        "updatedAt"
      FROM reports 
      WHERE "reportedBy" = $1
      ORDER BY "createdAt" DESC
    `, [user.id]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reports: result.rows })
    };

  } catch (err) {
    console.error('User Reports Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
