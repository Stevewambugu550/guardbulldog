const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return { 
        statusCode: 401, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: 'Invalid credentials' }) 
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { 
        statusCode: 401, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: 'Invalid credentials' }) 
      };
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'guardbulldog-secret-key-2024', { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department
        }
      }),
    };
  } catch (err) {
    console.error('Login Error:', err);
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: 'Server error during login.' }) 
    };
  }
};