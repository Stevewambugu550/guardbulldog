const pool = require('../config/database');

let inMemoryReports = [];
let useInMemory = false;
let nextReportId = 1;

const initStorage = async () => {
  try {
    await pool.query('SELECT 1');
    useInMemory = false;
  } catch (err) {
    useInMemory = true;
    console.log('📦 Using in-memory report storage (database unavailable)');
  }
};

initStorage();

// Generate unique tracking number like RPT-2024-0001
const generateTrackingNumber = async () => {
  const year = new Date().getFullYear();
  try {
    const result = await pool.query('SELECT COUNT(*) FROM reports');
    const count = parseInt(result.rows[0].count) + 1;
    return `RPT-${year}-${String(count).padStart(4, '0')}`;
  } catch {
    return `RPT-${year}-${Date.now().toString().slice(-4)}`;
  }
};

const Report = {
  async create(report) {
    const { reportedBy, trackingNumber, emailSubject, senderEmail, senderName, emailBody, emailHeaders, reportType, severity, attachments, ipAddress } = report;
    if (useInMemory) {
      const finalTrackingNumber = trackingNumber || await generateTrackingNumber();
      const now = new Date();
      const newReport = {
        id: nextReportId++,
        reportedBy,
        trackingNumber: finalTrackingNumber,
        subject: emailSubject,
        senderEmail,
        senderName: senderName || null,
        emailBody,
        emailHeaders: emailHeaders || null,
        reportType: reportType || 'phishing',
        severity: severity || 'medium',
        status: 'pending',
        attachments: attachments || null,
        ipAddress: ipAddress || null,
        createdAt: now,
        updatedAt: now
      };
      inMemoryReports.unshift(newReport);
      console.log('✅ Report created (in-memory):', finalTrackingNumber);
      return newReport;
    }
    try {
      // Use provided tracking number or generate one
      const finalTrackingNumber = trackingNumber || await generateTrackingNumber();
      const result = await pool.query(
        `INSERT INTO reports ("reportedBy", subject, "senderEmail", "emailBody", "emailHeaders", "reportType", "ipAddress", status, severity, "trackingNumber")
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9) RETURNING *`,
        [reportedBy, emailSubject, senderEmail, emailBody, emailHeaders || null, reportType || 'phishing', ipAddress || null, severity || 'medium', finalTrackingNumber]
      );
      console.log('✅ Report created:', finalTrackingNumber);
      return result.rows[0];
    } catch (err) {
      console.error('Report create error:', err.message);
      throw err;
    }
  },

  async findById(id) {
    if (useInMemory) {
      return inMemoryReports.find(r => r.id === parseInt(id));
    }
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByTrackingNumber(trackingNumber) {
    if (useInMemory) {
      return inMemoryReports.find(r => r.trackingNumber === trackingNumber);
    }
    const result = await pool.query('SELECT * FROM reports WHERE "trackingNumber" = $1', [trackingNumber]);
    return result.rows[0];
  },

  async findByUserId(userId) {
    if (useInMemory) {
      return inMemoryReports
        .filter(r => parseInt(r.reportedBy) === parseInt(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    const result = await pool.query('SELECT * FROM reports WHERE "reportedBy" = $1 ORDER BY "createdAt" DESC', [userId]);
    return result.rows;
  },

  async findAll(filters = {}) {
    if (useInMemory) {
      let reports = [...inMemoryReports];
      if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
      }
      if (filters.reportType) {
        reports = reports.filter(r => r.reportType === filters.reportType);
      }
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const offset = parseInt(filters.offset || 0);
      const limit = parseInt(filters.limit || reports.length);
      return reports.slice(offset, offset + limit);
    }
    try {
      let query = 'SELECT r.*, u."firstName", u."lastName", u.email as reporter_email FROM reports r LEFT JOIN users u ON r."reportedBy" = u.id';
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (filters.status) {
        conditions.push(`r.status = $${paramCount++}`);
        params.push(filters.status);
      }
      if (filters.reportType) {
        conditions.push(`r."reportType" = $${paramCount++}`);
        params.push(filters.reportType);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY r."createdAt" DESC';
      
      if (filters.limit) {
        query += ` LIMIT $${paramCount++}`;
        params.push(filters.limit);
      }
      if (filters.offset) {
        query += ` OFFSET $${paramCount++}`;
        params.push(filters.offset);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (err) {
      console.error('Report findAll error:', err.message);
      return [];
    }
  },

  async updateStatus(id, status) {
    if (useInMemory) {
      const report = inMemoryReports.find(r => r.id === parseInt(id));
      if (!report) return null;
      report.status = status;
      report.updatedAt = new Date();
      return report;
    }
    try {
      const result = await pool.query('UPDATE reports SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      return result.rows[0];
    } catch (err) {
      console.error('Update status error:', err.message);
      return null;
    }
  },

  async count(filters = {}) {
    if (useInMemory) {
      let reports = [...inMemoryReports];
      if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
      }
      if (filters.reportType) {
        reports = reports.filter(r => r.reportType === filters.reportType);
      }
      return reports.length;
    }
    try {
      let query = 'SELECT COUNT(*) FROM reports';
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (filters.status) {
        conditions.push(`status = $${paramCount++}`);
        params.push(filters.status);
      }
      if (filters.reportType) {
        conditions.push(`"reportType" = $${paramCount++}`);
        params.push(filters.reportType);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (err) {
      return 0;
    }
  },

  async getStats() {
    if (useInMemory) {
      const totals = {
        total: inMemoryReports.length,
        pending: inMemoryReports.filter(r => r.status === 'pending').length,
        resolved: inMemoryReports.filter(r => r.status === 'resolved').length,
        confirmed: inMemoryReports.filter(r => r.status === 'confirmed').length,
        investigating: inMemoryReports.filter(r => r.status === 'investigating').length,
        false_positive: inMemoryReports.filter(r => r.status === 'false_positive').length,
        phishing: inMemoryReports.filter(r => r.reportType === 'phishing').length,
        spam: inMemoryReports.filter(r => r.reportType === 'spam').length,
        malware: inMemoryReports.filter(r => r.reportType === 'malware').length
      };
      return totals;
    }
    try {
      const totalRes = await pool.query('SELECT COUNT(*) as total FROM reports');
      const pendingRes = await pool.query("SELECT COUNT(*) as pending FROM reports WHERE status = 'pending'");
      const resolvedRes = await pool.query("SELECT COUNT(*) as resolved FROM reports WHERE status = 'resolved'");
      const confirmedRes = await pool.query("SELECT COUNT(*) as confirmed FROM reports WHERE status = 'confirmed'");
      
      return { 
        total: parseInt(totalRes.rows[0].total) || 0, 
        pending: parseInt(pendingRes.rows[0].pending) || 0, 
        resolved: parseInt(resolvedRes.rows[0].resolved) || 0,
        confirmed: parseInt(confirmedRes.rows[0].confirmed) || 0,
        investigating: 0,
        false_positive: 0,
        phishing: 0,
        spam: 0,
        malware: 0
      };
    } catch (err) {
      console.error('GetStats error:', err.message);
      return { total: 0, pending: 0, resolved: 0, confirmed: 0, investigating: 0, false_positive: 0, phishing: 0, spam: 0, malware: 0 };
    }
  },

  async getTrending() { return []; },
  async addNote() { return { success: true }; },
  async getNotes() { return []; }
};

module.exports = Report;
