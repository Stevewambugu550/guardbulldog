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

const getColumns = async () => {
  const { rows } = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
  `);
  return rows.map(r => r.column_name);
};

const findCol = (existingCols, ...candidates) => {
  for (const c of candidates) {
    if (existingCols.includes(c)) return c;
  }
  return null;
};

const ensureUsersTable = async () => {
  const existingCols = await getColumns();

  if (existingCols.length === 0) {
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(30),
        password TEXT,
        role VARCHAR(50) DEFAULT 'student',
        department VARCHAR(100),
        createdat TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    return;
  }

  const safeAlter = async (sql) => {
    try { await pool.query(sql); } catch (e) {}
  };
  if (!findCol(existingCols, 'firstname', 'firstName')) await safeAlter(`ALTER TABLE users ADD COLUMN firstname VARCHAR(100)`);
  if (!findCol(existingCols, 'lastname', 'lastName')) await safeAlter(`ALTER TABLE users ADD COLUMN lastname VARCHAR(100)`);
  if (!findCol(existingCols, 'email')) await safeAlter(`ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE`);
  if (!findCol(existingCols, 'password')) await safeAlter(`ALTER TABLE users ADD COLUMN password TEXT`);
  if (!findCol(existingCols, 'phone')) await safeAlter(`ALTER TABLE users ADD COLUMN phone VARCHAR(30)`);
  if (!findCol(existingCols, 'role')) await safeAlter(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student'`);
  if (!findCol(existingCols, 'department')) await safeAlter(`ALTER TABLE users ADD COLUMN department VARCHAR(100)`);
  await safeAlter('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
  await safeAlter('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
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

    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ message: 'Email and password are required', msg: 'Email and password are required' }) 
      };
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

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

    const userFirstName = user.firstName || user.firstname || '';
    const userLastName = user.lastName || user.lastname || '';

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: userFirstName,
        lastName: userLastName
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
          firstName: userFirstName,
          lastName: userLastName,
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
      body: JSON.stringify({ message: 'Server error during login.', msg: 'Server error during login.', error: err.message }) 
    };
  }
};