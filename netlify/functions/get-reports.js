const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dQctU8NwB0jZ@ep-calm-hat-amhy391e.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
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
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    let result;

    if (isAdmin) {
      result = await pool.query(`
        SELECT 
          r.id, r."trackingNumber", r."senderEmail", r."senderName",
          r.subject, r."emailBody", r."emailHeaders",
          r."reportType", r.severity, r.status,
          r."reportedBy", r."createdAt", r."updatedAt",
          u."firstName", u."lastName", u.email as reporter_email
        FROM reports r
        LEFT JOIN users u ON r."reportedBy" = u.id
        ORDER BY r."createdAt" DESC
      `);
    } else {
      result = await pool.query(`
        SELECT 
          id, "trackingNumber", "senderEmail", "senderName",
          subject, "emailBody", "emailHeaders",
          "reportType", severity, status,
          "reportedBy", "createdAt", "updatedAt"
        FROM reports 
        WHERE "reportedBy" = $1
        ORDER BY "createdAt" DESC
      `, [user.id]);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reports: result.rows })
    };
  } catch (err) {
    console.error('Get Reports Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ msg: 'Server error fetching reports', error: err.message })
    };
  }
};
