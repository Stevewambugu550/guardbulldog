const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dQctU8NwB0jZ@ep-calm-hat-amhy391e.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const generateTrackingToken = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GB-${date}-${random}`;
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { email, subject, description, suspicious_url } = data;

    if (!subject || !description) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Subject and description are required' })
      };
    }

    const trackingNumber = generateTrackingToken();
    const emailBody = `${description}${suspicious_url ? `\n\nSuspicious URL: ${suspicious_url}` : ''}${email ? `\n\nReporter Email: ${email}` : ''}`;

    const result = await pool.query(
      `INSERT INTO reports 
        ("trackingNumber", "senderEmail", "senderName", subject, "emailBody", "reportType", severity, status, "reportedBy", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'phishing', 'medium', 'submitted', NULL, NOW(), NOW())
       RETURNING id, "trackingNumber", "createdAt"`,
      [trackingNumber, email || 'guest@anonymous', 'Guest Reporter', subject, emailBody]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Report submitted successfully! Save your tracking token to check status.',
        tracking_token: result.rows[0].trackingNumber,
        data: {
          tracking_token: result.rows[0].trackingNumber,
          report_id: result.rows[0].id,
          submitted_at: result.rows[0].createdAt
        }
      })
    };
  } catch (err) {
    console.error('Guest Submit Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Error submitting report', error: err.message })
    };
  }
};
