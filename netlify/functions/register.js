const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    const { firstName, lastName, email, password, phone, department } = JSON.parse(event.body);

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: 'User already exists' }) 
      };
    }

    // Check if this is the first user (make them admin)
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;
    const role = isFirstUser ? 'super_admin' : 'student';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO users ("firstName", "lastName", email, phone, password, role, department) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [firstName, lastName, email, phone || null, hashedPassword, role, department || 'Not Specified']
    );
    const newUser = result.rows[0];

    const payload = {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'guardbulldog-secret-key-2024', { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          department: newUser.department
        }
      }),
    };
  } catch (err) {
    console.error('Registration Error:', err);
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: 'Server error during registration.' }) 
    };
  }
};