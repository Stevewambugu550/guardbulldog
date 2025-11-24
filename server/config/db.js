const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  try {
    const client = await pool.connect();
    try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        department VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        "reportedBy" INTEGER,
        "emailSubject" TEXT,
        "senderEmail" VARCHAR(255),
        "emailBody" TEXT,
        "reportType" VARCHAR(255),
        "suspiciousLinks" TEXT,
        attachments TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        "updatedBy" INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("reportedBy") REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY ("updatedBy") REFERENCES users (id) ON DELETE SET NULL
      );
    `);

    // Report notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_notes (
        id SERIAL PRIMARY KEY,
        "reportId" INTEGER NOT NULL,
        note TEXT NOT NULL,
        "addedBy" INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("reportId") REFERENCES reports (id) ON DELETE CASCADE,
        FOREIGN KEY ("addedBy") REFERENCES users (id) ON DELETE SET NULL
      );
    `);

    // Education modules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS education_modules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        category VARCHAR(100),
        difficulty VARCHAR(50) DEFAULT 'beginner',
        duration INTEGER DEFAULT 10,
        quiz_questions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES education_modules(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        score INTEGER,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, module_id)
      );
    `);

    // Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

      console.log('✅ All database tables created successfully or already exist.');
    } catch (err) {
      console.error('❌ Error creating tables:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.log('⚠️ Database not available:', err.message);
  }
};

// Initialize tables on startup
createTables();

module.exports = {
  query: (text, params) => pool.query(text, params),
};