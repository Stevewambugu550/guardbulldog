// In-memory storage - NO DATABASE REQUIRED
const bcrypt = require('bcryptjs');

let users = [];
let nextId = 1;

// Create default admin user on startup
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
    console.log('✅ Default admin created: admin@bowiestate.edu / Admin@2024');
  }
};
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
      role: role || 'student',
      department: department || 'Not Specified',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    console.log('✅ User created:', email);
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