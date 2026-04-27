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

// Detect actual column names in the users table
const getColumns = async () => {
  const { rows } = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
  `);
  return rows.map(r => r.column_name);
};

// Find a column matching any of the given candidate names
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

  // Ensure required columns exist
  const safeAlter = async (sql) => {
    try { await pool.query(sql); } catch (e) {}
  };
  if (!findCol(existingCols, 'firstname', 'firstName')) await safeAlter(`ALTER TABLE users ADD COLUMN firstname VARCHAR(100)`);
  if (!findCol(existingCols, 'lastname', 'lastName')) await safeAlter(`ALTER TABLE users ADD COLUMN lastname VARCHAR(100)`);
  if (!findCol(existingCols, 'email')) await safeAlter(`ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE`);
  if (!findCol(existingCols, 'password', 'password_hash')) await safeAlter(`ALTER TABLE users ADD COLUMN password TEXT`);
  if (!findCol(existingCols, 'phone')) await safeAlter(`ALTER TABLE users ADD COLUMN phone VARCHAR(30)`);
  if (!findCol(existingCols, 'role')) await safeAlter(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student'`);
  if (!findCol(existingCols, 'department')) await safeAlter(`ALTER TABLE users ADD COLUMN department VARCHAR(100)`);
  // Make password columns nullable
  if (findCol(existingCols, 'password_hash')) await safeAlter('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
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
    const existingCols = await getColumns();

    const parsed = JSON.parse(event.body || '{}');
    const { firstName, lastName, email, password, phone, department } = parsed;

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

    // Check if this is the first user
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;
    const role = isFirstUser ? 'super_admin' : 'student';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use actual column names from DB
    const fnCol = findCol(existingCols, 'firstname', 'firstName') || 'firstname';
    const lnCol = findCol(existingCols, 'lastname', 'lastName') || 'lastname';
    const pwCol = findCol(existingCols, 'password_hash', 'password') || 'password';

    const result = await pool.query(
      `INSERT INTO users ("${fnCol}", "${lnCol}", email, phone, "${pwCol}", role, department) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [firstName, lastName, email, phone || null, hashedPassword, role, department || 'Not Specified']
    );
    const newUser = result.rows[0];

    // Extract values using both possible key casings
    const userFirstName = newUser.firstName || newUser.firstname || firstName;
    const userLastName = newUser.lastName || newUser.lastname || lastName;

    const payload = {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
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
          id: newUser.id,
          email: newUser.email,
          firstName: userFirstName,
          lastName: userLastName,
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