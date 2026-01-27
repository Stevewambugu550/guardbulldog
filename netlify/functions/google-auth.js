const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Decode Google JWT token
function decodeGoogleToken(credential) {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload;
  } catch (err) {
    console.error('Token decode error:', err);
    return null;
  }
}

exports.handler = async function (event, context) {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    const { credential } = JSON.parse(event.body);

    if (!credential) {
      return { statusCode: 400, headers, body: JSON.stringify({ msg: 'No credential provided' }) };
    }

    // Decode the Google JWT
    const googleUser = decodeGoogleToken(credential);
    
    if (!googleUser || !googleUser.email) {
      return { statusCode: 400, headers, body: JSON.stringify({ msg: 'Invalid Google token' }) };
    }

    const { email, given_name, family_name, picture, sub: googleId } = googleUser;

    // Check if user exists
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      // Create new user with Google account
      const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);
      
      // Check if this is the first user
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      const isFirstUser = parseInt(userCount.rows[0].count) === 0;
      const role = isFirstUser ? 'super_admin' : 'student';

      result = await pool.query(
        `INSERT INTO users ("firstName", "lastName", email, password, role, department) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [given_name || 'User', family_name || '', email, randomPassword, role, 'Not Specified']
      );
      user = result.rows[0];
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'guardbulldog-secret-key-2024', { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          picture: picture || null
        }
      })
    };
  } catch (err) {
    console.error('Google Auth Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ msg: 'Server error during Google authentication' })
    };
  }
};
