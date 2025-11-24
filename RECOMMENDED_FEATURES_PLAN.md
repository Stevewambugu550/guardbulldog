# GuardBulldog Recommended Features Implementation Plan

**Date:** November 24, 2025  
**Status:** 🚧 In Progress  
**Version:** 2.0 Enhancements

---

## 📋 Overview

This document outlines the implementation plan for the recommended features to enhance the GuardBulldog platform based on stakeholder feedback and system requirements analysis.

---

## ✨ Recommended Features

### 1. Guest Access System ✅
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Allow non-authenticated users (guests) to access limited functionality, primarily for quick phishing report submissions.

**Implementation:**
- Create guest reporting form without login requirement
- Track guest submissions with unique session IDs
- Collect minimal information (email, description, attachments)
- Provide unique tracking number for status checks
- Rate limiting for abuse prevention

**Technical Requirements:**
- New database table: `guest_reports`
- Modified API endpoint: `/api/reports/guest-submit`
- Session management without authentication
- Unique tracking token generation

**Benefits:**
- Lower barrier to entry for reporting
- Faster response to emerging threats
- Increased community participation

---

### 2. Email Date Storage & Tracking 📅
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Comprehensive date/timestamp tracking for all email reports to enable trend analysis and time-based investigations.

**Implementation:**
- Capture email received date from headers
- Store submission timestamp
- Track resolution timeline
- Record last modified dates
- Enable date-based filtering and reporting

**Technical Requirements:**
- Database schema updates for `reports` table:
  - `email_received_date` (TIMESTAMP)
  - `email_sent_date` (TIMESTAMP)
  - `submitted_at` (TIMESTAMP) - already exists
  - `first_viewed_at` (TIMESTAMP)
  - `resolved_at` (TIMESTAMP)
  - `last_modified_at` (TIMESTAMP)

**Benefits:**
- Better trend analysis
- Response time metrics
- Threat pattern identification
- Compliance documentation

---

### 3. Email Source Tracking 📍
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Capture and store detailed information about email sources to identify attack patterns and malicious actors.

**Implementation:**
- Parse email headers for source information
- Extract sender information
- Capture IP addresses
- Store email service provider data
- Track email routing path

**Technical Requirements:**
- New database columns:
  - `sender_email` (VARCHAR)
  - `sender_ip` (VARCHAR)
  - `sender_domain` (VARCHAR)
  - `email_headers` (JSONB)
  - `routing_information` (JSONB)
  - `mail_server` (VARCHAR)

**Data Points to Capture:**
- Sender email address
- Sender IP address
- Originating mail server
- SPF/DKIM/DMARC status
- Email routing path
- Attachment metadata

---

### 4. IP Address Intelligence System 🌐
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Capture and analyze IP addresses from reported emails to build threat intelligence database.

**Implementation:**
- Extract IP from email headers
- Perform geo-location lookup
- Check against known threat databases
- Store IP reputation data
- Build internal blacklist/greylist

**Technical Requirements:**
- New database table: `ip_intelligence`
  ```sql
  CREATE TABLE ip_intelligence (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE,
    country VARCHAR(100),
    city VARCHAR(100),
    isp VARCHAR(255),
    threat_level VARCHAR(20), -- safe, suspicious, dangerous
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    report_count INTEGER DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT false,
    reputation_score INTEGER, -- 0-100
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

**Integration:**
- IP geolocation API (e.g., IPinfo, MaxMind)
- Threat intelligence feeds
- Real-time IP reputation checking

---

### 5. AI-Powered Phishing Detection System 🤖
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Implement machine learning system to automatically analyze emails and determine if they are safe or phishing attempts.

**Implementation:**

**Phase 1: Rule-Based Detection**
- URL blacklist checking
- Suspicious keyword detection
- Sender reputation analysis
- Domain similarity checking
- Attachment type validation

**Phase 2: Machine Learning**
- Natural Language Processing (NLP) for content analysis
- URL pattern recognition
- Historical data training
- Continuous learning from user feedback

**Technical Requirements:**
- New database table: `phishing_indicators`
- AI service integration or local ML model
- Confidence scoring system (0-100%)
- Automated threat classification

**Detection Criteria:**
- Suspicious URLs
- Urgent language patterns
- Request for credentials
- Impersonation attempts
- Malicious attachments
- Domain spoofing

**Output:**
- Risk score (0-100)
- Classification (Safe, Suspicious, Phishing, Malware)
- Confidence level
- Explanation of findings

---

### 6. Target Audience Classification 🎯
**Priority:** Medium  
**Status:** To Be Implemented

**Description:**  
Enhanced user profiling to identify target demographics (student, faculty, staff) and analyze attack patterns.

**Implementation:**
- Expand user profile fields
- Add department/role classification
- Track targeted attack patterns
- Generate demographic reports

**Technical Requirements:**
- Database schema updates for `users` table:
  - `user_type` (student, faculty, staff, admin)
  - `department` (VARCHAR)
  - `academic_year` (for students)
  - `job_title` (for faculty/staff)
  - `is_high_value_target` (BOOLEAN)

**Analytics:**
- Most targeted user groups
- Attack vector preferences by demographic
- Department-specific threat reports
- Vulnerability assessments

---

### 7. User Inquiry System 📧
**Priority:** Medium  
**Status:** To Be Implemented

**Description:**  
Enable users to send direct inquiries to administrators for questions, concerns, or general communication.

**Implementation:**
- Create inquiry submission form
- Admin inbox for managing inquiries
- Email threading/conversations
- Status tracking (new, in-progress, resolved)
- Priority levels

**Technical Requirements:**
- New database table: `user_inquiries`
  ```sql
  CREATE TABLE user_inquiries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(20) DEFAULT 'new', -- new, in_progress, resolved
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
  );
  
  CREATE TABLE inquiry_responses (
    id SERIAL PRIMARY KEY,
    inquiry_id INTEGER REFERENCES user_inquiries(id),
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

**Features:**
- Rich text editor for inquiries
- File attachment support
- Email notifications
- Response threading
- Admin dashboard for management

---

### 8. Email-User Profile Integration 💾
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Capture and associate submitted emails with detailed user profiles for comprehensive reporting.

**Implementation:**
- Link reports to user accounts
- Store user context at submission time
- Track user's report history
- Generate user vulnerability profiles

**Technical Requirements:**
- Database relationships already exist
- Enhance with additional fields:
  - `user_vulnerability_score` (INTEGER)
  - `training_completion_status` (BOOLEAN)
  - `last_training_date` (TIMESTAMP)
  - `phishing_test_results` (JSONB)

**Data Captured:**
- User demographics
- Previous report history
- Training completion status
- Device/browser information
- Time of submission
- Location (if permitted)

---

### 9. System Architecture Documentation 📐
**Priority:** High  
**Status:** To Be Implemented

**Description:**  
Create comprehensive system architecture diagram showing the AI system, data flow, and component interactions.

**Deliverables:**
1. **System Architecture Diagram**
   - Frontend components
   - Backend services
   - Database structure
   - External integrations
   - Data flow paths

2. **AI System Architecture**
   - Data ingestion pipeline
   - Feature extraction
   - ML model structure
   - Classification engine
   - Feedback loop

3. **Security Architecture**
   - Authentication flow
   - Authorization layers
   - Data encryption
   - Threat detection pipeline

**Tools:**
- Draw.io / Lucidchart diagrams
- Mermaid diagrams in documentation
- Interactive HTML visualization

---

## 📊 Implementation Priority Matrix

| Feature | Priority | Complexity | Impact | Timeline |
|---------|----------|------------|--------|----------|
| Guest Access | High | Low | High | 1 week |
| Email Date Storage | High | Low | Medium | 3 days |
| Email Source Tracking | High | Medium | High | 1 week |
| IP Intelligence | High | Medium | High | 2 weeks |
| AI Phishing Detection | High | High | Very High | 3-4 weeks |
| Target Classification | Medium | Low | Medium | 3 days |
| User Inquiry System | Medium | Medium | Medium | 1 week |
| Email-Profile Integration | High | Low | High | 3 days |
| Architecture Diagrams | High | Low | High | 1 week |

**Total Estimated Timeline:** 8-10 weeks

---

## 🗄️ Database Schema Updates

### New Tables Required

```sql
-- Guest Reports Table
CREATE TABLE guest_reports (
    id SERIAL PRIMARY KEY,
    tracking_token VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    session_id VARCHAR(100)
);

-- IP Intelligence Table
CREATE TABLE ip_intelligence (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    isp VARCHAR(255),
    threat_level VARCHAR(20),
    report_count INTEGER DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT false,
    reputation_score INTEGER,
    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW()
);

-- Email Source Tracking Table
CREATE TABLE email_sources (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id),
    sender_email VARCHAR(255),
    sender_ip VARCHAR(45),
    sender_domain VARCHAR(255),
    mail_server VARCHAR(255),
    email_headers JSONB,
    routing_info JSONB,
    spf_status VARCHAR(20),
    dkim_status VARCHAR(20),
    dmarc_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Phishing Detection Results Table
CREATE TABLE phishing_detection_results (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id),
    risk_score INTEGER, -- 0-100
    classification VARCHAR(30), -- safe, suspicious, phishing, malware
    confidence_level DECIMAL(5,2), -- 0.00-100.00
    indicators_found JSONB,
    analysis_details TEXT,
    ai_model_version VARCHAR(20),
    analyzed_at TIMESTAMP DEFAULT NOW()
);

-- User Inquiries Table
CREATE TABLE user_inquiries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    guest_email VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'new',
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Inquiry Responses Table
CREATE TABLE inquiry_responses (
    id SERIAL PRIMARY KEY,
    inquiry_id INTEGER REFERENCES user_inquiries(id),
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Updates to Existing Tables

```sql
-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vulnerability_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_training_date TIMESTAMP;

-- Update reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_received_date TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_sent_date TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS sender_ip VARCHAR(45);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS risk_score INTEGER;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS auto_classification VARCHAR(30);
```

---

## 🔌 New API Endpoints

### Guest Access
- `POST /api/reports/guest-submit` - Submit report as guest
- `GET /api/reports/track/:token` - Track report status by token

### Email Intelligence
- `GET /api/intelligence/ip/:address` - Get IP intelligence data
- `GET /api/intelligence/domain/:domain` - Get domain reputation
- `POST /api/intelligence/analyze` - Analyze email for threats

### AI Detection
- `POST /api/ai/scan-email` - Scan email content for phishing
- `GET /api/ai/threat-level/:reportId` - Get AI threat assessment

### User Inquiries
- `POST /api/inquiries/submit` - Submit user inquiry
- `GET /api/inquiries/user` - Get user's inquiries
- `GET /api/inquiries/admin` - Get all inquiries (admin)
- `PUT /api/inquiries/:id/respond` - Respond to inquiry
- `PUT /api/inquiries/:id/status` - Update inquiry status

### Analytics
- `GET /api/analytics/by-user-type` - Reports by user demographic
- `GET /api/analytics/ip-threats` - IP-based threat analysis
- `GET /api/analytics/time-series` - Time-based trend analysis

---

## 🔐 Security Considerations

1. **Guest Access**
   - Rate limiting (max 5 submissions per IP per hour)
   - CAPTCHA implementation
   - Session tracking
   - IP logging

2. **IP Intelligence**
   - Secure API key management
   - Rate limit external API calls
   - Cache IP lookup results
   - Privacy compliance (GDPR)

3. **AI System**
   - Secure model storage
   - Input sanitization
   - Output validation
   - Version control for models

4. **Email Storage**
   - PII encryption
   - FERPA compliance
   - Data retention policies
   - Secure file storage

---

## 📈 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Guest Report Adoption | 30% of total reports | Analytics dashboard |
| AI Detection Accuracy | >90% | Manual validation |
| Response Time (Admin) | <24 hours | Time tracking |
| User Inquiry Resolution | <48 hours | Inquiry system |
| IP Intelligence Coverage | >80% of reports | Database query |
| False Positive Rate | <5% | User feedback |

---

## 🛠️ Technology Stack Additions

### AI/ML Components
- **Python**: Scikit-learn, TensorFlow/PyTorch
- **NLP**: SpaCy, NLTK
- **Email Parsing**: mail-parser, email package

### IP Intelligence
- **APIs**: IPinfo.io, MaxMind GeoIP2
- **Threat Feeds**: AbuseIPDB, Shodan

### Frontend Enhancements
- **Charts**: Chart.js, Recharts
- **Diagrams**: React Flow, Mermaid
- **Rich Text**: Quill, TinyMCE

---

## 📅 Implementation Timeline

### Week 1-2: Foundation
- [ ] Database schema updates
- [ ] API endpoint structure
- [ ] Guest access system

### Week 3-4: Intelligence
- [ ] Email source tracking
- [ ] IP intelligence integration
- [ ] Date/timestamp enhancements

### Week 5-6: AI Implementation
- [ ] Basic phishing detection rules
- [ ] ML model development
- [ ] Testing and validation

### Week 7-8: Features & UI
- [ ] User inquiry system
- [ ] Target classification
- [ ] Enhanced dashboards

### Week 9-10: Documentation & Testing
- [ ] System architecture diagrams
- [ ] Comprehensive testing
- [ ] User documentation
- [ ] Deployment

---

## 🎯 Next Steps

1. **Immediate Actions**
   - [ ] Review and approve implementation plan
   - [ ] Set up development environment for new features
   - [ ] Create feature branches in version control
   - [ ] Schedule team kickoff meeting

2. **Week 1 Sprint**
   - [ ] Implement database schema updates
   - [ ] Build guest access functionality
   - [ ] Create basic AI detection rules
   - [ ] Start IP intelligence integration

3. **Ongoing**
   - [ ] Daily standups for progress tracking
   - [ ] Weekly demos to stakeholders
   - [ ] Continuous testing and QA
   - [ ] Documentation updates

---

**Document Owner:** GuardBulldog Development Team  
**Last Updated:** November 24, 2025  
**Status:** 🚧 Ready for Implementation

**🛡️ Making GuardBulldog Even Better! 🚀**
