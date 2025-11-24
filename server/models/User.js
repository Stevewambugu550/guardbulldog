// In-memory storage for development (no database required)
let users = [];
let nextId = 1;

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