const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  const admin = verifyAdmin(event);
  if (!admin) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized - Admin access required' }) };
  }

  try {
    // GET - List all reports with reporter info
    if (event.httpMethod === 'GET') {
      const result = await pool.query(`
        SELECT 
          r.id,
          r."trackingNumber",
          r."senderEmail",
          r."senderName",
          r.subject,
          r."emailBody",
          r."reportType",
          r.severity,
          r.status,
          r."createdAt",
          r."updatedAt",
          u."firstName",
          u."lastName",
          u.email as reporter_email
        FROM reports r
        LEFT JOIN users u ON r."reportedBy" = u.id
        ORDER BY r."createdAt" DESC
      `);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reports: result.rows })
      };
    }

    // PUT - Update report status
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const reportId = pathParts[pathParts.length - 2];
      const { status } = JSON.parse(event.body);

      await pool.query(
        'UPDATE reports SET status = $1, "updatedAt" = NOW(), "reviewedBy" = $2, "reviewedAt" = NOW() WHERE id = $3',
        [status, admin.id, reportId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ msg: 'Report status updated' })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };

  } catch (err) {
    console.error('Admin Reports Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
