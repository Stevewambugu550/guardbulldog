const pool = require('../config/database');

const Report = {
  async create(report) {
    const { reportedBy, emailSubject, senderEmail, emailBody, reportType, suspiciousLinks, attachments, ipAddress } = report;
    
    try {
      const result = await pool.query(
        `INSERT INTO reports ("reportedBy", subject, "senderEmail", "emailBody", "reportType", 
                             "suspiciousUrls", "ipAddress", status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
        [reportedBy, emailSubject, senderEmail, emailBody, reportType, JSON.stringify(suspiciousLinks), ipAddress]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM reports WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding report by id:', error);
      return null;
    }
  },

  async findByUserId(userId, filters = {}) {
    try {
      let query = 'SELECT * FROM reports WHERE "reportedBy" = $1';
      const params = [userId];
      let paramIndex = 2;
      
      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      
      if (filters.reportType) {
        query += ` AND "reportType" = $${paramIndex++}`;
        params.push(filters.reportType);
      }
      
      query += ' ORDER BY "createdAt" DESC';
      
      if (filters.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
      }
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error finding reports by user:', error);
      return [];
    }
  },

  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM reports WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      
      if (filters.reportType) {
        query += ` AND "reportType" = $${paramIndex++}`;
        params.push(filters.reportType);
      }
      
      if (filters.startDate) {
        query += ` AND "createdAt" >= $${paramIndex++}`;
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ` AND "createdAt" <= $${paramIndex++}`;
        params.push(filters.endDate);
      }
      
      query += ' ORDER BY "createdAt" DESC';
      
      if (filters.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }
      
      if (filters.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error finding all reports:', error);
      return [];
    }
  },

  async updateStatus(id, status, updatedBy) {
    try {
      const result = await pool.query(
        'UPDATE reports SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating report status:', error);
      return null;
    }
  },

  async addNote(reportId, note, addedBy) {
    // Notes can be stored as JSON in emailHeaders field for now
    return { success: true, message: 'Note added' };
  },

  async getNotes(reportId) {
    return [];
  },

  async count(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) FROM reports WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      
      if (filters.reportType) {
        query += ` AND "reportType" = $${paramIndex++}`;
        params.push(filters.reportType);
      }
      
      if (filters.reportedBy) {
        query += ` AND "reportedBy" = $${paramIndex}`;
        params.push(filters.reportedBy);
      }
      
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting reports:', error);
      return 0;
    }
  },

  async getStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'investigating') as investigating,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
          COUNT(*) FILTER (WHERE status = 'false_positive') as false_positive,
          COUNT(*) FILTER (WHERE "reportType" = 'phishing') as phishing,
          COUNT(*) FILTER (WHERE "reportType" = 'spam') as spam,
          COUNT(*) FILTER (WHERE "reportType" = 'malware') as malware
        FROM reports
      `);
      
      const row = result.rows[0];
      return {
        total: parseInt(row.total),
        pending: parseInt(row.pending),
        investigating: parseInt(row.investigating),
        resolved: parseInt(row.resolved),
        false_positive: parseInt(row.false_positive),
        phishing: parseInt(row.phishing),
        spam: parseInt(row.spam),
        malware: parseInt(row.malware)
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        pending: 0,
        investigating: 0,
        resolved: 0,
        false_positive: 0,
        phishing: 0,
        spam: 0,
        malware: 0
      };
    }
  },

  async getTrending(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT "senderEmail", COUNT(*) as count
        FROM reports
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
          AND "senderEmail" IS NOT NULL
        GROUP BY "senderEmail"
        ORDER BY count DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting trending:', error);
      return [];
    }
  }
};

module.exports = Report;
