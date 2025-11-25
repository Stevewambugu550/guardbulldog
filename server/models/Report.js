const pool = require('../config/database');

const Report = {
  async create(report) {
    const { reportedBy, emailSubject, senderEmail, emailBody, reportType, suspiciousLinks, ipAddress } = report;
    try {
      const result = await pool.query(
        `INSERT INTO reports ("reportedBy", subject, "senderEmail", "emailBody", "reportType", "suspiciousUrls", "ipAddress", status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
        [reportedBy, emailSubject, senderEmail, emailBody, reportType, JSON.stringify(suspiciousLinks || []), ipAddress]
      );
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

  async findAll() {
    const result = await pool.query('SELECT * FROM reports ORDER BY "createdAt" DESC');
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query('UPDATE reports SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return result.rows[0];
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM reports');
    return parseInt(result.rows[0].count);
  },

  async getStats() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM reports');
      return { total: parseInt(result.rows[0].total), pending: 0, resolved: 0 };
    } catch {
      return { total: 0, pending: 0, resolved: 0 };
    }
  },

  async getTrending() { return []; },
  async addNote() { return { success: true }; },
  async getNotes() { return []; }
};

module.exports = Report;
