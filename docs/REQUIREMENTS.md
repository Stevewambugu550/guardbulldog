# System Requirements Specification Document

**Project:** GUARDBULLDOG Phishing Awareness & Reporting System  
**Version:** 1.0  
**Date:** Fall 2025  
**Status:** Approved  
**Authors:** GuardBulldog Development Team

---

## Document Overview

This System Requirements Specification (SRS) document provides a comprehensive description of the functional and non-functional requirements for the GUARDBULLDOG platform. It serves as the foundation for system design, development, testing, and validation activities.

### Purpose
The purpose of this document is to:
- Define all functional capabilities the system must provide
- Specify non-functional attributes including performance, security, and usability
- Establish acceptance criteria for system validation
- Provide a shared understanding among all stakeholders

### Scope
This document covers requirements for the GUARDBULLDOG web application, including user-facing features, administrative capabilities, and system-level specifications.

### Intended Audience
- Development Team
- Project Stakeholders
- Quality Assurance Team
- System Administrators
- End Users (Students, Faculty, Staff)

---

## 1. Functional Requirements

### 1.1 User Management

#### FR1.1.1 - User Registration
**Description:** Users (students, faculty, staff) shall be able to create an account using their Bowie State University email address.

**Acceptance Criteria:**
- System validates email domain (@bowie.edu, @bowiestate.edu)
- Password must meet complexity requirements (minimum 8 characters, uppercase, lowercase, number, special character)
- System prevents duplicate email registration
- User receives confirmation upon successful registration
- Account is created with default 'User' role

**Priority:** High  
**Dependencies:** None

#### FR1.1.2 - User Authentication
**Description:** Registered users shall be able to log in and log out securely using JWT-based authentication.

**Acceptance Criteria:**
- System verifies credentials against stored user records
- Passwords are compared using bcrypt hashing
- Successful login generates JWT token with 7-day expiration
- Token is stored securely in client-side storage
- Logout invalidates client-side token
- Failed login attempts display generic error message (security best practice)

**Priority:** High  
**Dependencies:** FR1.1.1

#### FR1.1.3 - Role-Based Access Control (RBAC)
**Description:** The system shall support three distinct user roles with hierarchical permissions: User, Admin, and Super Admin.

**Role Definitions:**
- **User:** Can submit reports, view own reports, access educational content, update profile
- **Admin:** All User permissions plus: review all reports, add notes, update report status, view analytics
- **Super Admin:** All Admin permissions plus: manage users, assign roles, access system health, perform bulk operations

**Acceptance Criteria:**
- System enforces role-based access at API level
- Unauthorized access attempts return 403 Forbidden
- Role changes take effect immediately
- Admin actions are logged in audit trail

**Priority:** High  
**Dependencies:** FR1.1.2

### 1.2 Phishing Report Submission

#### FR1.2.1 - Report Form
**Description:** Users shall be able to report suspicious emails through an intuitive, multi-step form interface.

**Form Fields:**
- Email subject (required, max 200 characters)
- Sender email address (required, email format validation)
- Email body content (required, max 5000 characters)
- Suspected threat type (dropdown: Phishing, Spam, Malware, Other)
- Additional comments (optional, max 1000 characters)
- File attachment (optional, .eml or .msg format)

**Acceptance Criteria:**
- Form validates all required fields before submission
- Real-time validation feedback for each field
- Form can be saved as draft and resumed later
- Submission completes within 3 seconds under normal load
- Mobile-responsive design for smartphone access

**Priority:** High  
**Dependencies:** FR1.1.2

#### FR1.2.2 - File Upload Support
**Description:** The system shall allow users to upload email files (.eml, .msg) as attachments to reports.

**Acceptance Criteria:**
- Accepts .eml and .msg file formats
- Maximum file size: 10MB
- Files are scanned for malware before storage
- Files are stored securely with encrypted names
- System extracts metadata from email files (sender, subject, date)
- Unsupported file types display clear error message

**Priority:** Medium  
**Dependencies:** FR1.2.1

#### FR1.2.3 - Submission Confirmation
**Description:** Users shall receive immediate confirmation upon successful report submission.

**Acceptance Criteria:**
- System generates unique tracking ID for each report
- Confirmation message displays tracking ID prominently
- User receives email notification with report details
- Report appears in user's "My Reports" dashboard immediately
- Confirmation includes estimated response time

**Priority:** High  
**Dependencies:** FR1.2.1

### 1.3 Incident Management (Admin Dashboard)

#### FR1.3.1 - View All Reports
**Description:** Administrators shall have access to a centralized dashboard displaying all user-submitted phishing reports with advanced filtering and search capabilities.

**Dashboard Features:**
- Paginated table view (25 reports per page)
- Sortable columns (date, status, severity, reporter)
- Filter by: status, date range, threat type, reporter
- Search by: tracking ID, sender email, keywords
- Export to CSV functionality
- Bulk selection for mass operations

**Acceptance Criteria:**
- Dashboard loads within 2 seconds
- Filters apply without page reload
- Search returns results in real-time
- Export includes all filtered results
- Responsive design for tablet access

**Priority:** High  
**Dependencies:** FR1.1.3

#### FR1.3.2 - Incident Status Tracking
**Description:** Administrators shall be able to update and track incident status through defined workflow states.

**Status Workflow:**
1. **Pending** - Initial submission state
2. **Under Review** - Analyst actively investigating
3. **Investigating** - Escalated for deeper analysis
4. **Resolved - Legitimate Threat** - Confirmed phishing, actions taken
5. **Resolved - False Positive** - Not a threat
6. **Closed** - Final state with resolution notes

**Acceptance Criteria:**
- Status changes trigger email notifications to reporter
- Status history is maintained with timestamps
- Only authorized roles can change status
- Status changes require mandatory notes (minimum 20 characters)
- Dashboard displays status distribution chart

**Priority:** High  
**Dependencies:** FR1.3.1

#### FR1.3.3 - Analytics and Reporting
**Description:** The admin dashboard shall display comprehensive analytics and key performance indicators (KPIs) for phishing incident trends.

**Analytics Components:**
- Total reports (today, this week, this month, all time)
- Reports by status (pie chart)
- Reports by threat type (bar chart)
- Trending threats (top 10 sender domains)
- Response time metrics (average time to resolution)
- User engagement statistics (active reporters)
- Time-series graph of report volume

**Acceptance Criteria:**
- All charts update in real-time
- Data can be filtered by date range
- Charts are exportable as PNG images
- Dashboard includes data refresh timestamp
- Mobile-optimized chart rendering

**Priority:** Medium  
**Dependencies:** FR1.3.1, FR1.3.2

### 1.4 Educational Content Management

#### FR1.4.1 - Learning Center
**Description:** The platform shall provide a comprehensive learning center with interactive educational materials about phishing awareness and cybersecurity best practices.

**Content Types:**
- **Articles:** Text-based guides with images and examples
- **Interactive Modules:** Step-by-step tutorials with checkpoints
- **Quizzes:** Multiple-choice assessments with instant feedback
- **Video Tutorials:** Embedded video content (YouTube/Vimeo)
- **Infographics:** Visual guides on recognizing threats
- **Case Studies:** Real-world phishing examples with analysis

**Acceptance Criteria:**
- Content is organized by difficulty level (Beginner, Intermediate, Advanced)
- Search functionality for finding specific topics
- Progress tracking for each user
- Completion certificates for finished modules
- Content is mobile-responsive
- Estimated reading time displayed for each article

**Priority:** Medium  
**Dependencies:** FR1.1.2

#### FR1.4.2 - Content Management System (CMS)
**Description:** Administrators shall have access to a content management interface for creating, editing, and publishing educational materials.

**CMS Features:**
- Rich text editor with formatting options
- Image upload and management
- Content preview before publishing
- Draft/Published status workflow
- Content versioning and revision history
- Scheduling for future publication
- Content analytics (views, completion rates)

**Acceptance Criteria:**
- Only Admin and Super Admin roles can access CMS
- Changes are saved automatically as drafts
- Published content appears immediately in Learning Center
- Deleted content is archived, not permanently removed
- Content editor supports markdown formatting

**Priority:** Low  
**Dependencies:** FR1.1.3, FR1.4.1

## 2. Non-Functional Requirements

### 2.1 Security Requirements

#### NFR2.1.1 - Authentication & Authorization
**Description:** The system shall implement industry-standard authentication and authorization mechanisms.

**Requirements:**
- JWT-based stateless authentication with 7-day token expiration
- Bcrypt password hashing with minimum 12 salt rounds
- Role-based access control (RBAC) enforced at API layer
- Secure session management with automatic timeout after 30 minutes of inactivity
- Protection against brute force attacks (rate limiting: 5 failed attempts = 15-minute lockout)

**Acceptance Criteria:**
- All API endpoints require valid JWT token except /login and /register
- Passwords never transmitted or stored in plaintext
- Token refresh mechanism implemented for seamless user experience
- Security headers implemented via Helmet.js

#### NFR2.1.2 - Data Protection
**Description:** All sensitive data shall be encrypted both in transit and at rest.

**Requirements:**
- HTTPS/TLS 1.3 for all client-server communication
- Database encryption for sensitive fields (passwords, personal information)
- Secure file storage with encrypted filenames
- Environment variables for sensitive configuration (never committed to version control)
- Compliance with FERPA regulations for student data

**Acceptance Criteria:**
- All HTTP requests automatically redirect to HTTPS
- Database connection uses SSL/TLS
- Uploaded files stored with UUID-based encrypted names
- No sensitive data in application logs

#### NFR2.1.3 - Input Validation & Sanitization
**Description:** All user input shall be validated and sanitized to prevent security vulnerabilities.

**Requirements:**
- Server-side validation for all form inputs
- SQL injection prevention via parameterized queries
- XSS protection through input sanitization
- CSRF protection for state-changing operations
- File upload validation (type, size, content scanning)

**Acceptance Criteria:**
- All database queries use prepared statements
- User input escaped before rendering in HTML
- File uploads rejected if they fail validation
- API returns detailed validation errors (400 Bad Request)

### 2.2 Performance Requirements

#### NFR2.2.1 - Response Time
**Description:** The system shall provide responsive user experience with minimal latency.

**Performance Targets:**
- Page load time: < 2 seconds (initial load)
- API response time: < 500ms (95th percentile)
- Database query execution: < 100ms (average)
- File upload processing: < 3 seconds for 10MB file
- Dashboard analytics refresh: < 1 second

**Acceptance Criteria:**
- Performance monitoring implemented (response time tracking)
- Database queries optimized with proper indexing
- Static assets cached with appropriate headers
- Lazy loading implemented for large datasets

#### NFR2.2.2 - Scalability & Concurrency
**Description:** The system shall handle growing user base and concurrent access without degradation.

**Scalability Targets:**
- Support minimum 100 concurrent users
- Handle 1,000 reports per day
- Database capacity for 100,000+ reports
- Horizontal scaling capability for future growth
- Auto-scaling based on load (cloud deployment)

**Acceptance Criteria:**
- Load testing validates 100 concurrent user capacity
- Database connection pooling implemented
- Stateless API design enables horizontal scaling
- Caching strategy reduces database load

#### NFR2.2.3 - Resource Optimization
**Description:** The system shall efficiently utilize server and client resources.

**Requirements:**
- Frontend bundle size < 500KB (gzipped)
- Database query result pagination (max 50 records per page)
- Image optimization and lazy loading
- Memory leak prevention in long-running sessions
- Efficient database indexing strategy

**Acceptance Criteria:**
- Webpack bundle analysis shows optimized chunks
- No memory leaks detected in 24-hour stress test
- Database queries use appropriate indexes
- Client-side caching reduces redundant API calls

### 2.3 Usability Requirements

#### NFR2.3.1 - User Interface Design
**Description:** The user interface shall be intuitive, accessible, and consistent across all pages.

**Design Principles:**
- Mobile-first responsive design (supports phones, tablets, desktops)
- WCAG 2.1 Level AA accessibility compliance
- Consistent color scheme and typography
- Clear visual hierarchy and navigation
- Helpful error messages and user guidance

**Acceptance Criteria:**
- Interface tested on Chrome, Firefox, Safari, Edge (latest versions)
- Responsive breakpoints: 320px, 768px, 1024px, 1440px
- Color contrast ratio meets WCAG standards
- Keyboard navigation fully functional
- Screen reader compatible

#### NFR2.3.2 - Simplified Workflows
**Description:** Critical user workflows shall be streamlined for efficiency.

**Workflow Requirements:**
- Report submission: Maximum 3 steps
- User registration: Maximum 2 steps
- Login process: Single page, remember me option
- Profile update: Inline editing with auto-save
- Search and filter: Real-time results without page reload

**Acceptance Criteria:**
- User testing validates workflow simplicity
- Average report submission time < 2 minutes
- No more than 3 clicks to reach any major feature
- Progress indicators for multi-step processes

#### NFR2.3.3 - Help & Documentation
**Description:** Users shall have access to contextual help and comprehensive documentation.

**Requirements:**
- Inline help tooltips for complex features
- Comprehensive user guide accessible from all pages
- FAQ section addressing common questions
- Video tutorials for key workflows
- Contact support option prominently displayed

**Acceptance Criteria:**
- Help content available without leaving current page
- Search functionality in documentation
- Video tutorials < 3 minutes each
- Support contact form with 24-hour response SLA

### 2.4 Reliability Requirements

#### NFR2.4.1 - System Availability
**Description:** The system shall maintain high availability with minimal downtime.

**Availability Targets:**
- Uptime: 99.5% (approximately 3.65 hours downtime per month)
- Planned maintenance windows: Off-peak hours only
- Graceful degradation during partial outages
- Automatic failover for critical components
- Health monitoring and alerting

**Acceptance Criteria:**
- Uptime monitoring implemented with alerting
- Maintenance notifications sent 48 hours in advance
- Database backups performed daily
- Disaster recovery plan documented and tested

#### NFR2.4.2 - Data Integrity & Backup
**Description:** System data shall be protected against loss or corruption.

**Requirements:**
- Automated daily database backups
- Transaction logging for audit trail
- Data validation before database commits
- Backup retention: 30 days
- Point-in-time recovery capability

**Acceptance Criteria:**
- Backup restoration tested monthly
- Database constraints prevent invalid data
- Audit logs capture all data modifications
- Backup verification automated

#### NFR2.4.3 - Error Handling & Recovery
**Description:** The system shall handle errors gracefully and provide recovery mechanisms.

**Requirements:**
- User-friendly error messages (no technical jargon)
- Automatic retry for transient failures
- Error logging for debugging and monitoring
- Fallback mechanisms for external service failures
- Session recovery after network interruptions

**Acceptance Criteria:**
- All errors logged with context and stack traces
- Users never see raw error messages
- Failed operations provide clear next steps
- System recovers automatically from transient errors

### 2.5 Maintainability Requirements

#### NFR2.5.1 - Code Quality
**Description:** Codebase shall follow best practices for long-term maintainability.

**Requirements:**
- Consistent coding standards (ESLint, Prettier)
- Comprehensive inline code comments
- Modular architecture with separation of concerns
- DRY (Don't Repeat Yourself) principle
- Version control with meaningful commit messages

**Acceptance Criteria:**
- Code passes linting without errors
- Functions have JSDoc documentation
- Code review required before merging
- Test coverage > 70% for critical paths

#### NFR2.5.2 - Documentation
**Description:** System shall have comprehensive technical documentation.

**Documentation Types:**
- API documentation (endpoints, parameters, responses)
- Database schema documentation
- Deployment guide
- Development environment setup guide
- Architecture diagrams

**Acceptance Criteria:**
- API documentation auto-generated from code
- README files in all major directories
- Architecture diagrams kept current
- Deployment guide tested by new team member

### 2.6 Compliance Requirements

#### NFR2.6.1 - Regulatory Compliance
**Description:** System shall comply with applicable regulations and standards.

**Compliance Areas:**
- FERPA (Family Educational Rights and Privacy Act)
- GDPR principles for data privacy
- University IT security policies
- Accessibility standards (WCAG 2.1)
- Industry best practices (OWASP Top 10)

**Acceptance Criteria:**
- Privacy policy clearly displayed
- User consent obtained for data collection
- Data retention policies implemented
- Security audit conducted before production launch

---

## 3. System Constraints

### 3.1 Technical Constraints
- Must use existing university infrastructure where applicable
- Database: PostgreSQL (university standard)
- Deployment: Cloud platform (Heroku/Netlify) or on-premise
- Browser support: Latest 2 versions of major browsers
- Mobile OS: iOS 13+, Android 8+

### 3.2 Business Constraints
- Budget: Academic project (minimal licensing costs)
- Timeline: One semester development cycle
- Resources: 5-person development team
- Scope: Bowie State University only (initial release)

### 3.3 Regulatory Constraints
- Must comply with FERPA for student data
- Must follow university IT security policies
- Must obtain approval from IT department before deployment

---

## 4. Assumptions and Dependencies

### 4.1 Assumptions
- Users have access to modern web browsers
- Users have basic computer literacy
- University email system is operational
- Internet connectivity is available
- Users understand basic phishing concepts

### 4.2 Dependencies
- PostgreSQL database availability
- Email service for notifications
- Cloud hosting platform (Heroku/Netlify)
- University IT approval for deployment
- Access to university email domain validation

---

## 5. Acceptance Criteria Summary

The GUARDBULLDOG system will be considered complete and ready for deployment when:

1. ✅ All High-priority functional requirements are implemented
2. ✅ Security requirements pass penetration testing
3. ✅ Performance benchmarks are met under load testing
4. ✅ Usability testing validates user workflows
5. ✅ System achieves 99.5% uptime during beta testing
6. ✅ All critical bugs are resolved
7. ✅ Documentation is complete and reviewed
8. ✅ University IT department approves deployment
9. ✅ User training materials are prepared
10. ✅ Backup and recovery procedures are tested

---

## 6. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Fall 2025 | GuardBulldog Team | Initial requirements specification |

---

## 7. Approval

This requirements specification has been reviewed and approved by:

**Project Stakeholders:**
- [ ] System Project Manager - Ashleigh Mosley
- [ ] System Designer/Architect - Amanda Burroughs
- [ ] System Implementator - Enrique Wallace
- [ ] System Analyst & Tester - Moustapha Thiam
- [ ] System Developer - Victory Ubogu

**Date of Approval:** _________________

---

**Document Status:** Living Document - Subject to updates based on stakeholder feedback and changing requirements

**Next Review Date:** End of Development Phase
