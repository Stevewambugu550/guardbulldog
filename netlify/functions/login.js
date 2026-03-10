const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Demo users for fallback when database is unavailable
const getDemoUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  return [
    { id: 1, firstName: 'Super', lastName: 'Admin', email: 'admin@bowie.edu', password: await bcrypt.hash('Admin123!', salt), role: 'admin', department: 'IT Security' },
    { id: 2, firstName: 'Security', lastName: 'Admin', email: 'security@bowie.edu', password: await bcrypt.hash('Security123!', salt), role: 'admin', department: 'Campus Security' },
    { id: 3, firstName: 'Test', lastName: 'Student', email: 'student@bowie.edu', password: await bcrypt.hash('Student123!', salt), role: 'student', department: 'Computer Science' },
    { id: 4, firstName: 'Test', lastName: 'Faculty', email: 'faculty@bowie.edu', password: await bcrypt.hash('Faculty123!', salt), role: 'faculty', department: 'Computer Science' }
  ];
};

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    const { email, password } = JSON.parse(event.body);
    let user = null;

    // Try database first
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      user = result.rows[0];
    } catch (dbError) {
      console.log('Database unavailable, using demo users');
      // Fallback to demo users
      const demoUsers = await getDemoUsers();
      user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

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