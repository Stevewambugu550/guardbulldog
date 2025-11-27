const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

    // Create Super Admin
    await pool.query(`
      INSERT INTO users ("firstName", "lastName", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin', 'User', 'admin@bowie.edu', adminPassword, 'super_admin', 'IT Security']);

    // Create Admin
    await pool.query(`
      INSERT INTO users ("firstName", "lastName", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Security', 'Officer', 'security@bowie.edu', securityPassword, 'admin', 'IT Security']);

    // Create Student
    await pool.query(`
      INSERT INTO users ("firstName", "lastName", email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['John', 'Student', 'student@bowie.edu', studentPassword, 'user', 'Computer Science']);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Admin accounts created successfully!',
        accounts: [
          { email: 'admin@bowie.edu', password: 'Admin123!', role: 'Super Admin' },
          { email: 'security@bowie.edu', password: 'Security123!', role: 'Admin' },
          { email: 'student@bowie.edu', password: 'Student123!', role: 'Student' }
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

