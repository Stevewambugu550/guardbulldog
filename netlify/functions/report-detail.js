const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dQctU8NwB0jZ@ep-calm-hat-amhy391e.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

  const user = verifyToken(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized' }) };
  }

  try {
    // Extract report ID from path: /api/reports/123 or /.netlify/functions/report-detail?id=123
    const pathParts = event.path.split('/');
    let reportId = pathParts[pathParts.length - 1];
    // Also check query string
    if (reportId === 'report-detail' || !reportId) {
      reportId = event.queryStringParameters?.id;
    }

    if (!reportId) {
      return { statusCode: 400, headers, body: JSON.stringify({ msg: 'Report ID is required' }) };
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    // GET - Fetch single report
    if (event.httpMethod === 'GET') {
      const result = await pool.query(`
        SELECT 
          r.id, r."trackingNumber", r."senderEmail", r."senderName",
          r.subject, r."emailBody", r."emailHeaders",
          r."reportType", r.severity, r.status,
          r."reportedBy", r."reviewedBy", r."reviewedAt",
          r."createdAt", r."updatedAt",
          u."firstName" as reporter_firstName, u."lastName" as reporter_lastName, u.email as reporter_email
        FROM reports r
        LEFT JOIN users u ON r."reportedBy" = u.id
        WHERE r.id = $1
      `, [reportId]);

      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ msg: 'Report not found' }) };
      }

      const report = result.rows[0];

      // Non-admin users can only see their own reports
      if (!isAdmin && report.reportedBy !== user.id) {
        return { statusCode: 403, headers, body: JSON.stringify({ msg: 'Access denied' }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ report })
      };
    }

    // PUT - Update report status (admin only)
    if (event.httpMethod === 'PUT') {
      if (!isAdmin) {
        return { statusCode: 403, headers, body: JSON.stringify({ msg: 'Admin access required' }) };
      }

      const { status, severity, notes } = JSON.parse(event.body || '{}');
      const updates = [];
      const values = [];
      let paramIdx = 1;

      if (status) {
        updates.push(`status = $${paramIdx++}`);
        values.push(status);
        updates.push(`"reviewedBy" = $${paramIdx++}`);
        values.push(user.id);
        updates.push(`"reviewedAt" = NOW()`);
      }
      if (severity) {
        updates.push(`severity = $${paramIdx++}`);
        values.push(severity);
      }

      if (updates.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ msg: 'No updates provided' }) };
      }

      updates.push(`"updatedAt" = NOW()`);
      values.push(reportId);

      await pool.query(
        `UPDATE reports SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
        values
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ msg: 'Report updated successfully' })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };
  } catch (err) {
    console.error('Report Detail Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ msg: 'Server error', error: err.message })
    };
  }
};
