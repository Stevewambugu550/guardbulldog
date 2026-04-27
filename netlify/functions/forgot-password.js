const { Pool } = require('pg');
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

const ensureResetTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      used BOOLEAN DEFAULT FALSE,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};

const ensureUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      "firstName" VARCHAR(100),
      "lastName" VARCHAR(100),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(30),
      password TEXT,
      role VARCHAR(50) DEFAULT 'student',
      department VARCHAR(100),
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed', msg: 'Method not allowed' }) };
  }

  try {
    await ensureResetTable();
    await ensureUsersTable();

    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email is required', msg: 'Email is required' })
      };
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    // Always return success to prevent email enumeration
    const genericSuccess = {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'If an account with that email exists, a reset token has been generated.',
        msg: 'If an account with that email exists, a reset token has been generated.'
      })
    };

    if (userResult.rows.length === 0) {
      return genericSuccess;
    }

    // Invalidate any existing unused tokens for this email
    await pool.query('UPDATE password_resets SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_resets (email, token, "expiresAt") VALUES ($1, $2, $3)',
      [email, resetToken, expiresAt]
    );

    // In production, send email with reset link containing the token.
    // For demo/development, return the token directly so the UI can use it.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Reset token generated successfully.',
        msg: 'Reset token generated successfully.',
        token: resetToken,
        email: email
      })
    };
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Server error processing request.',
        msg: 'Server error processing request.',
        error: err.message
      })
    };
  }
};
