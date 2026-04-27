require('dotenv').config({ path: '../../.env' });
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
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

    // Parse report data
    const { title, description, category, severity, senderEmail, senderName, subjectLine, suspiciousLinks } = JSON.parse(event.body);

    // Insert report into database
    const sql = `
      INSERT INTO reports (user_id, title, description, category, severity, sender_email, sender_name, subject_line, suspicious_links)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const linksArray = suspiciousLinks ? (Array.isArray(suspiciousLinks) ? suspiciousLinks : [suspiciousLinks]) : [];
    
    const result = await db.query(sql, [
      userId,
      title,
      description,
      category || 'email_phishing',
      severity || 'medium',
      senderEmail,
      senderName,
      subjectLine,
      linksArray
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ report: result.rows[0], msg: 'Report submitted successfully' }),
    };
  } catch (err) {
    console.error('Create Report Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: 'Server error creating report' }),
    };
  }
};
