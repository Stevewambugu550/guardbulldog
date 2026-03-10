const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// In-memory storage for when database is unavailable
let inMemoryUsers = [];
let useInMemory = false;
let nextId = 1;

// Initialize demo users for in-memory mode
const initDemoUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  
  inMemoryUsers = [
    {
      id: nextId++,
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@bowie.edu',
      password: await bcrypt.hash('Admin123!', salt),
      role: 'admin',
      department: 'IT Security',
      createdAt: new Date()
    },
    {
      id: nextId++,
      firstName: 'Security',
      lastName: 'Admin',
      email: 'security@bowie.edu',
      password: await bcrypt.hash('Security123!', salt),
      role: 'admin',
      department: 'Campus Security',
      createdAt: new Date()
    },
    {
      id: nextId++,
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@bowie.edu',
      password: await bcrypt.hash('Student123!', salt),
      role: 'student',
      department: 'Computer Science',
      createdAt: new Date()
    },
    {
      id: nextId++,
      firstName: 'Test',
      lastName: 'Faculty',
      email: 'faculty@bowie.edu',
      password: await bcrypt.hash('Faculty123!', salt),
      role: 'faculty',
      department: 'Computer Science',
      createdAt: new Date()
    }
  ];
  
  console.log('✅ Demo users initialized for in-memory mode:');
  console.log('   - admin@bowie.edu / Admin123!');
  console.log('   - security@bowie.edu / Security123!');
  console.log('   - student@bowie.edu / Student123!');
  console.log('   - faculty@bowie.edu / Faculty123!');
};

// Check database connection and fallback to in-memory
const initStorage = async () => {
  try {
    await pool.query('SELECT 1');
    useInMemory = false;
    console.log('✅ Using database storage');
  } catch (err) {
    useInMemory = true;
    console.log('📦 Using in-memory storage (database unavailable)');
    await initDemoUsers();
  }
};

// Initialize storage
initStorage();

const User = {
  async create(user) {
    if (useInMemory) {
      const newUser = {
        id: nextId++,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || null,
        password: user.password,
        role: user.role || 'student',
        department: user.department || 'Not Specified',
        createdAt: new Date()
      };
      inMemoryUsers.push(newUser);
      console.log('✅ User created (in-memory):', user.email);
      return newUser;
    }
    
    const { firstName, lastName, email, phone, password, role, department } = user;
    const result = await pool.query(
      `INSERT INTO users ("firstName", "lastName", email, phone, password, role, department) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [firstName, lastName, email, phone || null, password, role || 'student', department || 'Not Specified']
    );
    console.log('✅ User created:', email);
    return result.rows[0];
  },

  async findByEmail(email) {
    if (useInMemory) {
      return inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findByPhone(phone) {
    if (useInMemory) {
      return inMemoryUsers.find(u => u.phone === phone);
    }
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0];
  },

  async findByEmailOrPhone(identifier) {
    if (useInMemory) {
      return inMemoryUsers.find(u => u.email === identifier || u.phone === identifier);
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [identifier]);
    return result.rows[0];
  },

  async findById(id) {
    if (useInMemory) {
      return inMemoryUsers.find(u => u.id === parseInt(id));
    }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findFirstUser() {
    if (useInMemory) {
      return inMemoryUsers[0];
    }
    const result = await pool.query('SELECT * FROM users LIMIT 1');
    return result.rows[0];
  },
  
  async findAll() {
    if (useInMemory) {
      return [...inMemoryUsers].sort((a, b) => b.createdAt - a.createdAt);
    }
    const result = await pool.query('SELECT * FROM users ORDER BY "createdAt" DESC');
    return result.rows;
  },

  async count(filters = {}) {
    if (useInMemory) {
      if (filters.role) {
        return inMemoryUsers.filter(u => u.role === filters.role).length;
      }
      return inMemoryUsers.length;
    }
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
    if (useInMemory) {
      const user = inMemoryUsers.find(u => u.id === parseInt(userId));
      if (user) {
        user.role = role;
        return user;
      }
      return null;
    }
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
    if (useInMemory) {
      const index = inMemoryUsers.findIndex(u => u.id === parseInt(userId));
      if (index > -1) {
        const deleted = inMemoryUsers.splice(index, 1);
        return deleted[0];
      }
      return null;
    }
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
    if (useInMemory) {
      const user = inMemoryUsers.find(u => u.id === parseInt(userId));
      if (user) {
        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.email) user.email = updates.email;
        if (updates.phone) user.phone = updates.phone;
        if (updates.department) user.department = updates.department;
        return user;
      }
      return null;
    }
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
    if (useInMemory) {
      const user = inMemoryUsers.find(u => u.id === parseInt(userId));
      if (user) {
        user.password = hashedPassword;
        return user;
      }
      return null;
    }
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