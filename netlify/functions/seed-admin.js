const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dQctU8NwB0jZ@ep-calm-hat-amhy391e.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

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

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get actual column names
    const existingCols = await getColumns();

    if (existingCols.length === 0) {
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          firstname VARCHAR(255),
          lastname VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(50),
          password TEXT,
          role VARCHAR(50) DEFAULT 'student',
          department VARCHAR(255),
          createdat TIMESTAMPTZ DEFAULT NOW()
        )
      `);
    }

    // Ensure required columns
    const safeAlter = async (sql) => {
      try { await pool.query(sql); } catch (e) {}
    };
    if (!findCol(existingCols, 'firstname', 'firstName')) await safeAlter(`ALTER TABLE users ADD COLUMN firstname VARCHAR(255)`);
    if (!findCol(existingCols, 'lastname', 'lastName')) await safeAlter(`ALTER TABLE users ADD COLUMN lastname VARCHAR(255)`);
    if (!findCol(existingCols, 'password')) await safeAlter(`ALTER TABLE users ADD COLUMN password TEXT`);
    if (!findCol(existingCols, 'role')) await safeAlter(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student'`);
    if (!findCol(existingCols, 'department')) await safeAlter(`ALTER TABLE users ADD COLUMN department VARCHAR(255)`);
    await safeAlter('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
    await safeAlter('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');

    // Get updated column list
    const cols = await getColumns();
    const fnCol = findCol(cols, 'firstname', 'firstName') || 'firstname';
    const lnCol = findCol(cols, 'lastname', 'lastName') || 'lastname';

    // Check if admin already exists
    const existingAdmin = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      ['admin@bowie.edu']
    );

    if (existingAdmin.rows.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Admin account already exists!',
          credentials: {
            email: 'admin@bowie.edu',
            password: 'Admin123!'
          }
        })
      };
    }

    // Hash passwords
    const salt = await bcrypt.genSalt(12);
    const adminPassword = await bcrypt.hash('Admin123!', salt);
    const securityPassword = await bcrypt.hash('Security123!', salt);
    const studentPassword = await bcrypt.hash('Student123!', salt);
    const facultyPassword = await bcrypt.hash('Faculty123!', salt);

    // Create Super Admin
    await pool.query(`
      INSERT INTO users ("${fnCol}", "${lnCol}", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin', 'User', 'admin@bowie.edu', adminPassword, 'super_admin', 'IT Security']);

    // Create Admin
    await pool.query(`
      INSERT INTO users ("${fnCol}", "${lnCol}", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Security', 'Officer', 'security@bowie.edu', securityPassword, 'admin', 'IT Security']);

    // Create Student
    await pool.query(`
      INSERT INTO users ("${fnCol}", "${lnCol}", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['John', 'Student', 'student@bowie.edu', studentPassword, 'student', 'Computer Science']);

    // Create Faculty
    await pool.query(`
      INSERT INTO users ("${fnCol}", "${lnCol}", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Jane', 'Faculty', 'faculty@bowie.edu', facultyPassword, 'faculty', 'Information Technology']);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Admin accounts created successfully!',
        accounts: [
          { email: 'admin@bowie.edu', password: 'Admin123!', role: 'Super Admin' },
          { email: 'security@bowie.edu', password: 'Security123!', role: 'Admin' },
          { email: 'student@bowie.edu', password: 'Student123!', role: 'Student' },
          { email: 'faculty@bowie.edu', password: 'Faculty123!', role: 'Faculty' }
        ]
      })
    };

  } catch (error) {
    console.error('Seed error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

