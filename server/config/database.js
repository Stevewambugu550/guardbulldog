const { Pool } = require('pg');
require('dotenv').config();

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFgeuMKSqk98@ep-polished-scene-ah90agqp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        department VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        "trackingNumber" VARCHAR(50) UNIQUE,
        "reportedBy" INTEGER REFERENCES users(id),
        "senderEmail" VARCHAR(255),
        "senderName" VARCHAR(255),
        subject VARCHAR(500),
        "emailBody" TEXT,
        "emailHeaders" TEXT,
        "suspiciousUrls" TEXT,
        "reportType" VARCHAR(50) DEFAULT 'phishing',
        severity VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        attachments TEXT,
        "ipAddress" VARCHAR(50),
        "reviewedBy" INTEGER REFERENCES users(id),
        "reviewedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS guest_reports (
        id SERIAL PRIMARY KEY,
        "trackingToken" VARCHAR(255) UNIQUE NOT NULL,
        "senderEmail" VARCHAR(255),
        subject VARCHAR(500),
        "emailBody" TEXT,
        "suspiciousUrls" TEXT,
        "ipAddress" VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        "submitterIp" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ip_intelligence (
        id SERIAL PRIMARY KEY,
        "ipAddress" VARCHAR(50) UNIQUE NOT NULL,
        country VARCHAR(100),
        city VARCHAR(100),
        region VARCHAR(100),
        isp VARCHAR(255),
        location VARCHAR(100),
        "threatLevel" VARCHAR(50) DEFAULT 'safe',
        "reputationScore" INTEGER DEFAULT 50,
        "reportCount" INTEGER DEFAULT 0,
        "isBlacklisted" BOOLEAN DEFAULT FALSE,
        "lastSeen" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Database tables initialized');

    // Add new columns if they don't exist (for existing databases)
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS "trackingNumber" VARCHAR(50) UNIQUE`);
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'medium'`);
      console.log('✅ Database columns updated');
    } catch (e) {
      console.log('Column migration:', e.message);
    }
    
    // Create default admin user
    const adminExists = await pool.query(`SELECT * FROM users WHERE email = 'admin@bowiestate.edu'`);
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin@2024', 10);
      await pool.query(`
        INSERT INTO users ("firstName", "lastName", email, password, role, department)
        VALUES ('Admin', 'GuardBulldog', 'admin@bowiestate.edu', $1, 'admin', 'IT Security')
      `, [hashedPassword]);
      console.log('✅ Default admin user created: admin@bowiestate.edu / Admin@2024');
    }
    
  } catch (err) {
    console.log('⚠️ Database initialization failed:', err.message);
    console.log('Application will run with in-memory storage');
  }
};

// Initialize on startup
initializeDatabase();

module.exports = pool;
