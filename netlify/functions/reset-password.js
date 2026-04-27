const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed', msg: 'Method not allowed' }) };
  }

  try {
    const { token, password } = JSON.parse(event.body || '{}');

    if (!token || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Token and new password are required', msg: 'Token and new password are required' })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Password must be at least 6 characters', msg: 'Password must be at least 6 characters' })
      };
    }

    // Find valid reset token
    const resetResult = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND "expiresAt" > NOW()',
      [token]
    );

    if (resetResult.rows.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid or expired reset token', msg: 'Invalid or expired reset token' })
      };
    }

    const resetRecord = resetResult.rows[0];
    const email = resetRecord.email;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, email]
    );

    if (updateResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'User not found', msg: 'User not found' })
      };
    }

    // Mark token as used
    await pool.query('UPDATE password_resets SET used = TRUE WHERE token = $1', [token]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Password has been reset successfully. You can now log in with your new password.',
        msg: 'Password has been reset successfully. You can now log in with your new password.'
      })
    };
  } catch (err) {
    console.error('Reset Password Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Server error resetting password.',
        msg: 'Server error resetting password.',
        error: err.message
      })
    };
  }
};
