const pool = require('../config/database');

const User = {
  async create(user) {
    const { firstName, lastName, email, password, role, department } = user;
    
    try {
      const result = await pool.query(
        `INSERT INTO users ("firstName", "lastName", email, password, role, department)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [firstName, lastName, email, password, role || 'student', department || 'Not Specified']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      return null;
    }
  },

  async findFirstUser() {
    try {
      const result = await pool.query('SELECT * FROM users LIMIT 1');
      return result.rows[0];
    } catch (error) {
      console.error('Error finding first user:', error);
      return null;
    }
  },
  
  async findAll() {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY "createdAt" DESC');
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }
};

module.exports = User;