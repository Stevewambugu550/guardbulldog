const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/database');

// Create messages table if not exists
const initMessagesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        subject VARCHAR(255),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Messages table ready');
  } catch (err) {
    console.log('Messages table check:', err.message);
  }
};
setTimeout(initMessagesTable, 3000);

// Get all messages for a user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
        u1."firstName" as sender_first_name, u1."lastName" as sender_last_name, u1.email as sender_email,
        u2."firstName" as receiver_first_name, u2."lastName" as receiver_last_name
       FROM messages m 
       LEFT JOIN users u1 ON m.sender_id = u1.id
       LEFT JOIN users u2 ON m.receiver_id = u2.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1 
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver_id, subject, content } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, receiver_id, subject, content]
    );
    res.status(201).json({ message: 'Message sent', data: result.rows[0] });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all messages
router.get('/admin/all', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
        u1."firstName" as sender_first_name, u1."lastName" as sender_last_name, u1.email as sender_email,
        u2."firstName" as receiver_first_name, u2."lastName" as receiver_last_name
       FROM messages m 
       LEFT JOIN users u1 ON m.sender_id = u1.id
       LEFT JOIN users u2 ON m.receiver_id = u2.id
       ORDER BY m.created_at DESC LIMIT 100`
    );
    res.json({ messages: result.rows });
  } catch (err) {
    res.json({ messages: [] });
  }
});

// Admin: Send message to user
router.post('/admin/send', auth, async (req, res) => {
  try {
    const { user_id, subject, content } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, user_id, subject, content]
    );
    res.status(201).json({ message: 'Message sent to user', data: result.rows[0] });
  } catch (err) {
    console.error('Admin send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.query('UPDATE messages SET is_read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's messages (alias for /)
router.get('/user', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
        u1."firstName" as sender_first_name, u1."lastName" as sender_last_name, u1.email as sender_email,
        u2."firstName" as receiver_first_name, u2."lastName" as receiver_last_name
       FROM messages m 
       LEFT JOIN users u1 ON m.sender_id = u1.id
       LEFT JOIN users u2 ON m.receiver_id = u2.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1 
       ORDER BY m.created_at ASC`,
      [req.user.id]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Get user messages error:', err);
    res.json({ messages: [] });
  }
});

// Get list of admins for user to message
router.get('/admins', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "firstName", "lastName", email FROM users WHERE role IN ('admin', 'super_admin') ORDER BY "firstName"`
    );
    res.json({ admins: result.rows });
  } catch (err) {
    console.error('Get admins error:', err);
    res.json({ admins: [] });
  }
});

// User sends message to admin
router.post('/send', auth, async (req, res) => {
  try {
    const { receiver_id, subject, content } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, receiver_id, subject || 'User Message', content]
    );
    res.status(201).json({ message: 'Message sent successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
