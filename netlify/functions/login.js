const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const ensureUsersTable = async () => {
  const { rows: colRows } = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
  `);
  const existingCols = colRows.map(r => r.column_name);

  if (existingCols.length === 0) {
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
  } else {
    const safeAlter = async (sql) => {
      try { await pool.query(sql); } catch (e) { /* column likely exists */ }
    };
    if (existingCols.includes('firstname') && !existingCols.includes('firstName')) {
      await safeAlter(`ALTER TABLE users RENAME COLUMN firstname TO "firstName"`);
    }
    if (existingCols.includes('lastname') && !existingCols.includes('lastName')) {
      await safeAlter(`ALTER TABLE users RENAME COLUMN lastname TO "lastName"`);
    }
    if (existingCols.includes('createdat') && !existingCols.includes('createdAt')) {
      await safeAlter(`ALTER TABLE users RENAME COLUMN createdat TO "createdAt"`);
    }
    await safeAlter('ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT');
    await safeAlter('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)');
    await safeAlter('ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)');
    await safeAlter("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student'");
    await safeAlter('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
    await safeAlter('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed', msg: 'Method not allowed' }) };
  }

  try {
    await ensureUsersTable();

    const { email, password } = JSON.parse(event.body);
    let user = null;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    user = result.rows[0];

    if (!user) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ message: 'Invalid credentials', msg: 'Invalid credentials' }) 
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ message: 'Invalid credentials', msg: 'Invalid credentials' }) 
      };
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName || user.firstname || '',
        lastName: user.lastName || user.lastname || ''
      },
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
          firstName: user.firstName || user.firstname || '',
          lastName: user.lastName || user.lastname || '',
          role: user.role,
          department: user.department
        }
      }),
    };
  } catch (err) {
    console.error('Login Error:', err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Server error during login.', msg: 'Server error during login.' }) 
    };
  }
};