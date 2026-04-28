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
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Verify admin token
const verifyAdmin = (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guardbulldog-secret-key-2024');
    const role = decoded?.user?.role ? String(decoded.user.role).toLowerCase() : '';
    if (decoded.user && (role === 'admin' || role === 'super_admin')) {
      return decoded.user;
    }
    return null;
  } catch (err) {
    return null;
  }
};

const getColumns = async (table) => {
  const { rows } = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public'
  `, [table]);
  return rows.map(r => r.column_name);
};

const findCol = (cols, ...candidates) => {
  for (const c of candidates) { if (cols.includes(c)) return c; }
  return null;
};

const ensureUsersTable = async () => {
  const cols = await getColumns('users');
  const safeAlter = async (sql) => { try { await pool.query(sql); } catch (e) {} };

  if (cols.length === 0) {
    await pool.query(`CREATE TABLE users (
      id SERIAL PRIMARY KEY, firstname VARCHAR(100), lastname VARCHAR(100),
      email VARCHAR(255) UNIQUE, phone VARCHAR(30), password TEXT,
      role VARCHAR(50) DEFAULT 'student', department VARCHAR(100),
      createdat TIMESTAMPTZ DEFAULT NOW()
    )`);
    return;
  }
  if (!findCol(cols, 'firstname', 'firstName')) await safeAlter(`ALTER TABLE users ADD COLUMN firstname VARCHAR(100)`);
  if (!findCol(cols, 'lastname', 'lastName')) await safeAlter(`ALTER TABLE users ADD COLUMN lastname VARCHAR(100)`);
  if (!findCol(cols, 'password', 'password_hash')) await safeAlter(`ALTER TABLE users ADD COLUMN password TEXT`);
  if (!findCol(cols, 'phone')) await safeAlter(`ALTER TABLE users ADD COLUMN phone VARCHAR(30)`);
  if (!findCol(cols, 'role')) await safeAlter(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student'`);
  if (!findCol(cols, 'department')) await safeAlter(`ALTER TABLE users ADD COLUMN department VARCHAR(100)`);
  if (findCol(cols, 'password_hash')) await safeAlter('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
  await safeAlter('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const admin = verifyAdmin(event);
  if (!admin) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized - Admin access required' }) };
  }

  try {
    await ensureUsersTable();

    // GET - List all users
    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT id, "firstName", "lastName", email, phone, role, department, "createdAt" FROM users ORDER BY "createdAt" DESC'
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ users: result.rows })
      };
    }

    // POST - Create new user
    if (event.httpMethod === 'POST') {
      const { firstName, lastName, email, phone, password, role, department } = JSON.parse(event.body);
      
      // Check if user exists
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ msg: 'User already exists' }) };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users ("firstName", "lastName", email, phone, password, role, department) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, "firstName", "lastName", email, role`,
        [firstName, lastName, email, phone || null, hashedPassword, role || 'student', department || 'Not Specified']
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ msg: 'User created', user: result.rows[0] })
      };
    }

    // DELETE - Delete user
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const userId = pathParts[pathParts.length - 1];
      
      if (!userId || isNaN(userId)) {
        return { statusCode: 400, headers, body: JSON.stringify({ msg: 'Invalid user ID' }) };
      }

      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      return { statusCode: 200, headers, body: JSON.stringify({ msg: 'User deleted' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };

  } catch (err) {
    console.error('Admin Users Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ msg: 'Server error', error: err.message }) };
  }
};
