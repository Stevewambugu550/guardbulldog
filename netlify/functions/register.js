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
  // Check if table exists and inspect actual column names
  const { rows: colRows } = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
  `);
  const existingCols = colRows.map(r => r.column_name);

  if (existingCols.length === 0) {
    // Table doesn't exist yet - create it
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
    // Table exists - ensure all needed columns exist
    const safeAlter = async (sql) => {
      try { await pool.query(sql); } catch (e) { /* column likely exists */ }
    };

    // If lowercase columns exist without camelCase, add the camelCase versions
    if (existingCols.includes('firstname') && !existingCols.includes('firstName')) {
      await safeAlter(`ALTER TABLE users RENAME COLUMN firstname TO "firstName"`);
    } else if (!existingCols.includes('firstname') && !existingCols.includes('firstName')) {
      await safeAlter(`ALTER TABLE users ADD COLUMN "firstName" VARCHAR(100)`);
    }

    if (existingCols.includes('lastname') && !existingCols.includes('lastName')) {
      await safeAlter(`ALTER TABLE users RENAME COLUMN lastname TO "lastName"`);
    } else if (!existingCols.includes('lastname') && !existingCols.includes('lastName')) {
      await safeAlter(`ALTER TABLE users ADD COLUMN "lastName" VARCHAR(100)`);
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

    const parsed = JSON.parse(event.body || '{}');
    const { firstName, lastName, email, password, phone, department } = parsed;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'First name, last name, email, and password are required', msg: 'First name, last name, email, and password are required' })
      };
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ message: 'User already exists', msg: 'User already exists' }) 
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
      headers,
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
      headers,
      body: JSON.stringify({ 
        message: 'Server error during registration.', 
        msg: 'Server error during registration.',
        error: err.message 
      }) 
    };
  }
};