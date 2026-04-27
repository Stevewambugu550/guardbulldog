const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dQctU8NwB0jZ@ep-calm-hat-amhy391e.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

const statusMessages = {
  submitted: 'Your report has been submitted and is pending review.',
  pending: 'Your report has been submitted and is pending review.',
  investigating: 'Our security team is currently investigating your report.',
  resolved: 'Your report has been resolved. Thank you for helping keep our community safe!',
  false_positive: 'After investigation, this email appears to be legitimate.'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  try {
    // Extract token from path: /api/guest/track/GB-XXXX
    const pathParts = event.path.split('/');
    const token = pathParts[pathParts.length - 1];

    if (!token || !token.startsWith('GB-')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid tracking token format' })
      };
    }

    const result = await pool.query(
      `SELECT id, "trackingNumber", subject, "emailBody", status, "createdAt", "updatedAt"
       FROM reports WHERE "trackingNumber" = $1 LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'Report not found. Please check your tracking token.' })
      };
    }

    const report = result.rows[0];
    const hoursElapsed = Math.floor((new Date() - new Date(report.createdAt)) / (1000 * 60 * 60));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          tracking_token: report.trackingNumber,
          subject: report.subject,
          description: report.emailBody,
          status: report.status,
          submitted_at: report.createdAt,
          hours_elapsed: hoursElapsed,
          status_message: statusMessages[report.status] || 'Status unknown'
        }
      })
    };
  } catch (err) {
    console.error('Guest Track Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Error retrieving report status' }) };
  }
};
