// In-memory storage for development (no database required)
const bcrypt = require('bcryptjs');

let users = [];
let nextId = 1;

// Create default admin user
const createDefaultAdmin = async () => {
  const adminExists = users.find(u => u.email === 'admin@bowiestate.edu');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@2024', 10);
    users.push({
      id: nextId++,
      firstName: 'Admin',
      lastName: 'GuardBulldog',
      email: 'admin@bowiestate.edu',
      password: hashedPassword,
      role: 'admin',
      department: 'IT Security',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Default admin user created: admin@bowiestate.edu / Admin@2024');
  }
};

// Create admin on startup
createDefaultAdmin();

const User = {
  async create(user) {
    const { firstName, lastName, email, password, role, department } = user;
    const newUser = {
      id: nextId++,
      firstName,
      lastName,
      email,
      password,
      role: role || 'user',
      department: department || 'Not Specified',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },

  async findByEmail(email) {
    return users.find(user => user.email === email);
  },

  async findById(id) {
    return users.find(user => user.id === parseInt(id));
  },

  async findFirstUser() {
    return users[0];
  },
  
  async findAll() {
    return users;
  }
};

module.exports = User;