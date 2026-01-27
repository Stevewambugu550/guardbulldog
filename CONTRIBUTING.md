# 🤝 Contributing to GuardBulldog

Thank you for your interest in contributing to GuardBulldog! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v12 or higher
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/guardbulldog.git
   cd guardbulldog
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/guardbulldog.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

5. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Setup database**
   ```bash
   createdb guardbulldog
   npm run seed
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Test backend
npm run server

# Test frontend
npm run client

# Run any existing tests
npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "type: brief description"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub
- Click "New Pull Request"
- Select your branch
- Fill out PR template
- Submit for review

---

## 💻 Coding Standards

### JavaScript/React Style

- Use ES6+ syntax
- Use functional components with hooks
- Use meaningful variable names
- Keep functions small and focused
- Avoid deeply nested code

### Example:

```javascript
// Good
const handleSubmit = async (formData) => {
  try {
    const response = await submitReport(formData);
    showSuccessMessage(response.message);
  } catch (error) {
    showErrorMessage(error.message);
  }
};

// Avoid
function handleSubmit(formData) {
  submitReport(formData).then(function(response) {
    showSuccessMessage(response.message);
  }).catch(function(error) {
    showErrorMessage(error.message);
  });
}
```

### File Organization

```
component/
├── ComponentName.jsx       # Component logic
├── ComponentName.css       # Styles (if not using Tailwind)
└── index.js               # Export
```

### Naming Conventions

- **Components**: PascalCase (`UserDashboard.jsx`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case or PascalCase (`user-service.js` or `UserService.js`)

---

## 📝 Commit Guidelines

### Commit Message Format

```
type: subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks

### Examples

```bash
# Good commits
git commit -m "feat: add email notification for report status updates"
git commit -m "fix: resolve CORS issue in production environment"
git commit -m "docs: update API documentation for guest endpoints"

# Avoid
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "changes"
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.logs in production code
- [ ] Tests pass (if applicable)
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. Submit PR
2. Automated checks run
3. Team review (1-2 reviewers)
4. Address feedback
5. Approval and merge

---

## 🧪 Testing

### Manual Testing

1. **Test the feature**
   - Use the application as an end user
   - Test edge cases
   - Test error scenarios

2. **Cross-browser testing**
   - Chrome
   - Firefox
   - Safari
   - Edge

3. **Responsive testing**
   - Mobile (320px+)
   - Tablet (768px+)
   - Desktop (1024px+)

### Writing Tests (Future)

```javascript
// Example test structure
describe('Report Submission', () => {
  it('should submit report successfully', async () => {
    // Test implementation
  });

  it('should handle validation errors', async () => {
    // Test implementation
  });
});
```

---

## 📚 Documentation

### Code Documentation

```javascript
/**
 * Submits a phishing report to the backend API
 * @param {Object} reportData - The report data
 * @param {string} reportData.subject - Email subject
 * @param {string} reportData.sender - Sender email
 * @param {File} reportData.attachment - Optional attachment
 * @returns {Promise<Object>} API response
 */
const submitReport = async (reportData) => {
  // Implementation
};
```

### README Updates

When adding features, update:
- Feature list
- API endpoints (if applicable)
- Environment variables (if new ones added)
- Setup instructions (if changed)

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Mockups, examples, etc.
```

---

## 🎯 Areas for Contribution

### High Priority

- Email notification system
- Advanced analytics dashboard
- Browser extension
- Mobile app (React Native)

### Medium Priority

- Additional education modules
- Gamification features
- Multi-language support
- Dark mode

### Good First Issues

- UI/UX improvements
- Documentation updates
- Bug fixes
- Test coverage

---

## 📞 Getting Help

**Questions?**
- Open a GitHub Discussion
- Check existing issues
- Contact project maintainers

**Team Contacts:**
- Project Lead: [contact]
- Technical Lead: [contact]
- Documentation: [contact]

---

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to GuardBulldog! 🛡️**

Together, we're making the digital world safer.
