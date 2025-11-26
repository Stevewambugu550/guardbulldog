const pool = require('../config/database');

const Report = {
  async create(report) {
    const { reportedBy, emailSubject, senderEmail, emailBody, reportType, suspiciousLinks, ipAddress, severity } = report;
    try {
      const result = await pool.query(
        `INSERT INTO reports ("reportedBy", subject, "senderEmail", "emailBody", "reportType", "suspiciousUrls", "ipAddress", status, severity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8) RETURNING *`,
        [reportedBy, emailSubject, senderEmail, emailBody, reportType || 'phishing', JSON.stringify(suspiciousLinks || []), ipAddress, severity || 'medium']
      );
      console.log('✅ Report created:', result.rows[0].id);
      return result.rows[0];
    } catch (err) {
      console.error('Report create error:', err.message);
      throw err;
    }
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query('SELECT * FROM reports WHERE "reportedBy" = $1 ORDER BY "createdAt" DESC', [userId]);
    return result.rows;
  },

  async findAll(filters = {}) {
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
    try {
      const result = await pool.query('UPDATE reports SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      return result.rows[0];
    } catch (err) {
      console.error('Update status error:', err.message);
      return null;
    }
  },

  async count(filters = {}) {
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
