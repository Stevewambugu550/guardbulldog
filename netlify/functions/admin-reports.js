const { Pool } = require('pg');
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

const ensureReportsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      "trackingNumber" VARCHAR(64) UNIQUE NOT NULL,
      "senderEmail" VARCHAR(255),
      "senderName" VARCHAR(255),
      subject TEXT,
      "emailBody" TEXT,
      "emailHeaders" TEXT,
      "reportType" VARCHAR(64) DEFAULT 'phishing',
      severity VARCHAR(32) DEFAULT 'medium',
      status VARCHAR(32) DEFAULT 'pending',
      "reportedBy" INTEGER NULL,
      "reviewedBy" INTEGER NULL,
      "reviewedAt" TIMESTAMPTZ NULL,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  const safeAlter = async (sql) => {
    try { await pool.query(sql); } catch (e) { /* column likely exists */ }
  };
  await safeAlter('ALTER TABLE reports ADD COLUMN IF NOT EXISTS "emailHeaders" TEXT');
  await safeAlter('ALTER TABLE reports ADD COLUMN IF NOT EXISTS "senderName" VARCHAR(255)');
  await safeAlter('ALTER TABLE reports ADD COLUMN IF NOT EXISTS severity VARCHAR(32) DEFAULT \'medium\'');
  await safeAlter('ALTER TABLE reports ALTER COLUMN "trackingNumber" DROP NOT NULL');
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

  const admin = verifyAdmin(event);
  if (!admin) {
    return { statusCode: 401, headers, body: JSON.stringify({ msg: 'Unauthorized - Admin access required' }) };
  }

  try {
    await ensureReportsTable();
    await ensureUsersTable();

    // GET - List all reports with reporter info, or single report by ID
    if (event.httpMethod === 'GET') {
      // Check if requesting a single report by ID via query param
      const reportId = event.queryStringParameters?.id;
      
      if (reportId) {
        const result = await pool.query(`
          SELECT 
            r.id, r."trackingNumber", r."senderEmail", r."senderName",
            r.subject, r."emailBody", r."emailHeaders",
            r."reportType", r.severity, r.status,
            r."reportedBy", r."reviewedBy", r."reviewedAt",
            r."createdAt", r."updatedAt",
            u."firstName", u."lastName", u.email as reporter_email
          FROM reports r
          LEFT JOIN users u ON r."reportedBy" = u.id
          WHERE r.id = $1
        `, [reportId]);

        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ msg: 'Report not found' }) };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ report: result.rows[0] })
        };
      }

      // Detect actual user column names
      const { rows: userCols } = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
      `);
      const colNames = userCols.map(r => r.column_name);
      const fnCol = colNames.includes('firstName') ? '"firstName"' : colNames.includes('firstname') ? 'firstname' : 'NULL';
      const lnCol = colNames.includes('lastName') ? '"lastName"' : colNames.includes('lastname') ? 'lastname' : 'NULL';

      // List all reports
      const result = await pool.query(`
        SELECT 
          r.id,
          r."trackingNumber",
          r."senderEmail",
          r."senderName",
          r.subject,
          r."emailBody",
          r."emailHeaders",
          r."reportType",
          r.severity,
          r.status,
          r."reportedBy",
          r."createdAt",
          r."updatedAt",
          u.${fnCol} as "firstName",
          u.${lnCol} as "lastName",
          u.email as reporter_email
        FROM reports r
        LEFT JOIN users u ON r."reportedBy" = u.id
        ORDER BY r."createdAt" DESC
      `);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reports: result.rows })
      };
    }

    // PUT - Update report status
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      // Accept reportId from body or from path
      const reportId = body.reportId || body.id || (() => {
        const pathParts = event.path.split('/');
        return pathParts[pathParts.length - 1];
      })();
      const { status, notes } = body;

      if (!reportId || !status) {
        return { statusCode: 400, headers, body: JSON.stringify({ msg: 'reportId and status are required' }) };
      }

      await pool.query(
        `UPDATE reports SET status = $1, "updatedAt" = NOW(), "reviewedBy" = $2, "reviewedAt" = NOW() WHERE id = $3`,
        [status, admin.id, reportId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ msg: 'Report status updated', reportId, status })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ msg: 'Method not allowed' }) };

  } catch (err) {
    console.error('Admin Reports Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ msg: 'Server error' }) };
  }
};
