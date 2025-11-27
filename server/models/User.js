const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Create default admin on startup
const createDefaultAdmin = async () => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@bowiestate.edu']);
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@2024', 10);
      await pool.query(
        `INSERT INTO users ("firstName", "lastName", email, password, role, department) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Admin', 'GuardBulldog', 'admin@bowiestate.edu', hashedPassword, 'admin', 'IT Security']
      );
      console.log('✅ Default admin created: admin@bowiestate.edu / Admin@2024');
    }
  } catch (err) {
    console.log('Admin creation skipped:', err.message);
  }
};

// Initialize after 2 seconds (wait for tables)
setTimeout(createDefaultAdmin, 2000);

const User = {
  async create(user) {
    const { firstName, lastName, email, phone, password, role, department } = user;
    const result = await pool.query(
      `INSERT INTO users ("firstName", "lastName", email, phone, password, role, department) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [firstName, lastName, email, phone || null, password, role || 'student', department || 'Not Specified']
    );
    console.log('✅ User created:', email);
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findByPhone(phone) {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0];
  },

  async findByEmailOrPhone(identifier) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [identifier]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findFirstUser() {
    const result = await pool.query('SELECT * FROM users LIMIT 1');
    return result.rows[0];
  },
  
  async findAll() {
    const result = await pool.query('SELECT * FROM users ORDER BY "createdAt" DESC');
    return result.rows;
  },

  async count(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) FROM users';
      const params = [];
      
      if (filters.role) {
        query += ' WHERE role = $1';
        params.push(filters.role);
      }
      
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (err) {
      console.log('Count error:', err.message);
      return 0;
    }
  },

  async updateRole(userId, role) {
    try {
      const result = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
        [role, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.log('Update role error:', err.message);
      return null;
    }
  },

  async delete(userId) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [userId]
      );
      return result.rows[0];
    } catch (err) {
      console.log('Delete user error:', err.message);
      return null;
    }
  },

  async update(userId, updates) {
    try {
      const { firstName, lastName, email, phone, department } = updates;
      const result = await pool.query(
        'UPDATE users SET "firstName" = COALESCE($1, "firstName"), "lastName" = COALESCE($2, "lastName"), email = COALESCE($3, email), phone = COALESCE($4, phone), department = COALESCE($5, department) WHERE id = $6 RETURNING *',
        [firstName, lastName, email, phone, department, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.log('Update user error:', err.message);
      return null;
    }
  },

  async updatePassword(userId, hashedPassword) {
    try {
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
        [hashedPassword, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.log('Update password error:', err.message);
      return null;
    }
  }
};

module.exports = User;