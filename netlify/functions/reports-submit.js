const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dQctU8NwB0jZ@ep-calm-hat-amhy391e.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

const generateTrackingNumber = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GB-${date}-${random}`;
};

// Parse multipart form-data (text fields only; skip files for demo)
const parseMultipart = (body, contentType) => {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!boundaryMatch) return null;
  const boundary = '--' + (boundaryMatch[1] || boundaryMatch[2]);
  const fields = {};
  const parts = body.split(boundary);
  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    // Skip file fields
    if (/filename="/.test(part)) continue;
    const valueStart = part.indexOf('\r\n\r\n');
    if (valueStart === -1) continue;
    let value = part.substring(valueStart + 4);
    // Strip trailing \r\n and possible trailing --
    value = value.replace(/\r\n$/, '').replace(/\r\n--$/, '');
    fields[name] = value;
  }
  return fields;
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed', msg: 'Method not allowed' })
    };
  }

  const user = verifyToken(event);
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, message: 'Unauthorized', msg: 'Unauthorized' })
    };
  }

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    let data = {};
    if (contentType.includes('multipart/form-data')) {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('binary')
        : event.body;
      data = parseMultipart(rawBody, contentType) || {};
    } else {
      data = JSON.parse(event.body || '{}');
    }

    const senderEmail = data.senderEmail || data.sender_email || '';
    const senderName = data.senderName || data.sender_name || '';
    const subject = data.subject || data.subjectLine || data.subject_line || 'No subject';
    const emailBody = data.emailBody || data.description || data.email_body || '';
    const reportType = data.reportType || data.category || 'phishing';
    const severity = data.severity || 'medium';
    const trackingNumber = generateTrackingNumber();

    const result = await pool.query(
      `INSERT INTO reports 
        ("trackingNumber", "senderEmail", "senderName", subject, "emailBody", "reportType", severity, status, "reportedBy", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, NOW(), NOW())
       RETURNING *`,
      [trackingNumber, senderEmail, senderName, subject, emailBody, reportType, severity, user.id]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Report submitted successfully',
        msg: 'Report submitted successfully',
        reportId: result.rows[0].id,
        trackingNumber: result.rows[0].trackingNumber,
        tracking_token: result.rows[0].trackingNumber,
        data: {
          report_id: result.rows[0].id,
          tracking_token: result.rows[0].trackingNumber,
          report: result.rows[0]
        },
        report: result.rows[0]
      })
    };
  } catch (err) {
    console.error('Report Submit Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Server error submitting report',
        msg: 'Server error submitting report',
        error: err.message
      })
    };
  }
};
