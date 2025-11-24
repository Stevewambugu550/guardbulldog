-- ============================================================================
-- GUARDBULLDOG DATABASE SCHEMA UPDATES - VERSION 2.0
-- Recommended Features Implementation
-- Date: November 24, 2025
-- ============================================================================

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- Guest Reports Table (Feature #1: Allow Guest Access)
CREATE TABLE IF NOT EXISTS guest_reports (
    id SERIAL PRIMARY KEY,
    tracking_token VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    suspicious_url VARCHAR(500),
    attachment_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    ip_address VARCHAR(45),
    session_id VARCHAR(100),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100)
);

-- IP Intelligence Table (Feature #6: IP Address Tracking & Analysis)
CREATE TABLE IF NOT EXISTS ip_intelligence (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    isp VARCHAR(255),
    threat_level VARCHAR(20) DEFAULT 'unknown' CHECK (threat_level IN ('safe', 'suspicious', 'dangerous', 'unknown')),
    report_count INTEGER DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT false,
    reputation_score INTEGER DEFAULT 50, -- 0-100 scale
    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Source Tracking Table (Feature #4: Email Source Information)
CREATE TABLE IF NOT EXISTS email_sources (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    guest_report_id INTEGER REFERENCES guest_reports(id) ON DELETE CASCADE,
    sender_email VARCHAR(255),
    sender_ip VARCHAR(45),
    sender_domain VARCHAR(255),
    reply_to_email VARCHAR(255),
    mail_server VARCHAR(255),
    email_headers JSONB,
    routing_info JSONB,
    spf_status VARCHAR(20), -- pass, fail, softfail, neutral, none
    dkim_status VARCHAR(20),
    dmarc_status VARCHAR(20),
    email_received_date TIMESTAMP,
    email_sent_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_report CHECK (
        (report_id IS NOT NULL AND guest_report_id IS NULL) OR
        (report_id IS NULL AND guest_report_id IS NOT NULL)
    )
);

-- Phishing Detection Results Table (Feature #7: AI Phishing Detection)
CREATE TABLE IF NOT EXISTS phishing_detection_results (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    guest_report_id INTEGER REFERENCES guest_reports(id) ON DELETE CASCADE,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    classification VARCHAR(30) CHECK (classification IN ('safe', 'suspicious', 'phishing', 'malware', 'spam')),
    confidence_level DECIMAL(5,2) CHECK (confidence_level >= 0 AND confidence_level <= 100),
    indicators_found JSONB, -- Array of detected indicators
    suspicious_patterns JSONB, -- Patterns that raised flags
    url_analysis JSONB, -- Results from URL scanning
    content_analysis TEXT,
    ai_model_version VARCHAR(20),
    analyzed_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_detection_report CHECK (
        (report_id IS NOT NULL AND guest_report_id IS NULL) OR
        (report_id IS NULL AND guest_report_id IS NOT NULL)
    )
);

-- User Inquiries Table (Feature #9: User-Admin Communication)
CREATE TABLE IF NOT EXISTS user_inquiries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    category VARCHAR(50) DEFAULT 'general', -- general, technical, report, feedback
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    CONSTRAINT check_inquiry_contact CHECK (
        (user_id IS NOT NULL AND guest_email IS NULL) OR
        (user_id IS NULL AND guest_email IS NOT NULL)
    )
);

-- Inquiry Responses Table (Feature #9: Communication Thread)
CREATE TABLE IF NOT EXISTS inquiry_responses (
    id SERIAL PRIMARY KEY,
    inquiry_id INTEGER REFERENCES user_inquiries(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admin_email VARCHAR(255), -- For guest inquiries
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT false,
    is_internal_note BOOLEAN DEFAULT false, -- Notes visible only to admins
    attachments JSONB, -- Array of attachment paths
    created_at TIMESTAMP DEFAULT NOW()
);

-- Threat Intelligence Indicators Table
CREATE TABLE IF NOT EXISTS threat_indicators (
    id SERIAL PRIMARY KEY,
    indicator_type VARCHAR(20) NOT NULL, -- url, domain, ip, hash, email
    indicator_value VARCHAR(500) NOT NULL,
    threat_type VARCHAR(30), -- phishing, malware, spam, scam
    severity VARCHAR(20), -- low, medium, high, critical
    source VARCHAR(100), -- manual, automated, external_feed
    first_detected TIMESTAMP DEFAULT NOW(),
    last_detected TIMESTAMP DEFAULT NOW(),
    detection_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_indicators_value ON threat_indicators(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_type ON threat_indicators(indicator_type);

-- ============================================================================
-- UPDATES TO EXISTING TABLES
-- ============================================================================

-- Update users table (Feature #5: Target Classification)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'student' 
    CHECK (user_type IN ('student', 'faculty', 'staff', 'admin', 'guest'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vulnerability_score INTEGER DEFAULT 0 CHECK (vulnerability_score >= 0 AND vulnerability_score <= 100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_training_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS training_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phishing_tests_passed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phishing_tests_failed INTEGER DEFAULT 0;

-- Update reports table (Feature #2: Enhanced Date Tracking)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_received_date TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_sent_date TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS sender_ip VARCHAR(45);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS auto_classification VARCHAR(30);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS confidence_level DECIMAL(5,2);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS target_type VARCHAR(20); -- student, faculty, staff
ALTER TABLE reports ADD COLUMN IF NOT EXISTS attack_vector VARCHAR(50); -- email, sms, voice, social_media

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Guest Reports
CREATE INDEX IF NOT EXISTS idx_guest_reports_token ON guest_reports(tracking_token);
CREATE INDEX IF NOT EXISTS idx_guest_reports_email ON guest_reports(email);
CREATE INDEX IF NOT EXISTS idx_guest_reports_status ON guest_reports(status);
CREATE INDEX IF NOT EXISTS idx_guest_reports_created ON guest_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_reports_ip ON guest_reports(ip_address);

-- IP Intelligence
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_ip ON ip_intelligence(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_threat ON ip_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_blacklist ON ip_intelligence(is_blacklisted);

-- Email Sources
CREATE INDEX IF NOT EXISTS idx_email_sources_report ON email_sources(report_id);
CREATE INDEX IF NOT EXISTS idx_email_sources_guest ON email_sources(guest_report_id);
CREATE INDEX IF NOT EXISTS idx_email_sources_sender_ip ON email_sources(sender_ip);
CREATE INDEX IF NOT EXISTS idx_email_sources_domain ON email_sources(sender_domain);

-- Phishing Detection
CREATE INDEX IF NOT EXISTS idx_detection_report ON phishing_detection_results(report_id);
CREATE INDEX IF NOT EXISTS idx_detection_guest ON phishing_detection_results(guest_report_id);
CREATE INDEX IF NOT EXISTS idx_detection_classification ON phishing_detection_results(classification);
CREATE INDEX IF NOT EXISTS idx_detection_risk ON phishing_detection_results(risk_score DESC);

-- User Inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON user_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON user_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON user_inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON user_inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON user_inquiries(created_at DESC);

-- Inquiry Responses
CREATE INDEX IF NOT EXISTS idx_responses_inquiry ON inquiry_responses(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON inquiry_responses(user_id);

-- Enhanced Reports Indexes
CREATE INDEX IF NOT EXISTS idx_reports_risk_score ON reports(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_reports_classification ON reports(auto_classification);
CREATE INDEX IF NOT EXISTS idx_reports_target_type ON reports(target_type);

-- Enhanced Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_vulnerability ON users(vulnerability_score DESC);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View: Combined Reports (Regular + Guest)
CREATE OR REPLACE VIEW all_reports AS
SELECT 
    'regular' as report_type,
    r.id,
    r.user_id,
    u.email as reporter_email,
    r.subject,
    r.description,
    r.status,
    r.created_at,
    r.risk_score,
    r.auto_classification,
    r.target_type
FROM reports r
LEFT JOIN users u ON r.user_id = u.id
UNION ALL
SELECT 
    'guest' as report_type,
    g.id,
    NULL as user_id,
    g.email as reporter_email,
    g.subject,
    g.description,
    g.status,
    g.created_at,
    NULL as risk_score,
    NULL as auto_classification,
    NULL as target_type
FROM guest_reports g;

-- View: Threat Intelligence Dashboard
CREATE OR REPLACE VIEW threat_intelligence_summary AS
SELECT 
    i.ip_address,
    i.country,
    i.threat_level,
    i.reputation_score,
    i.report_count,
    i.is_blacklisted,
    i.last_seen,
    COUNT(DISTINCT es.id) as associated_reports,
    MAX(pdr.risk_score) as max_risk_score
FROM ip_intelligence i
LEFT JOIN email_sources es ON i.ip_address = es.sender_ip
LEFT JOIN phishing_detection_results pdr ON (es.report_id = pdr.report_id OR es.guest_report_id = pdr.guest_report_id)
GROUP BY i.id, i.ip_address, i.country, i.threat_level, i.reputation_score, i.report_count, i.is_blacklisted, i.last_seen;

-- View: User Risk Profile
CREATE OR REPLACE VIEW user_risk_profiles AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.user_type,
    u.department,
    u.vulnerability_score,
    u.training_completed,
    u.phishing_tests_passed,
    u.phishing_tests_failed,
    COUNT(r.id) as total_reports,
    AVG(r.risk_score) as avg_risk_score,
    MAX(r.created_at) as last_report_date
FROM users u
LEFT JOIN reports r ON u.id = r.user_id
GROUP BY u.id, u.email, u.name, u.user_type, u.department, u.vulnerability_score, 
         u.training_completed, u.phishing_tests_passed, u.phishing_tests_failed;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function: Update IP Intelligence Last Seen
CREATE OR REPLACE FUNCTION update_ip_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ip_intelligence
    SET 
        last_seen = NOW(),
        report_count = report_count + 1,
        updated_at = NOW()
    WHERE ip_address = NEW.sender_ip;
    
    IF NOT FOUND THEN
        INSERT INTO ip_intelligence (ip_address, report_count, last_seen)
        VALUES (NEW.sender_ip, 1, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update IP intelligence on new email source
CREATE TRIGGER trg_update_ip_intelligence
AFTER INSERT ON email_sources
FOR EACH ROW
WHEN (NEW.sender_ip IS NOT NULL)
EXECUTE FUNCTION update_ip_last_seen();

-- Function: Calculate User Vulnerability Score
CREATE OR REPLACE FUNCTION calculate_user_vulnerability()
RETURNS TRIGGER AS $$
DECLARE
    failed_tests INTEGER;
    recent_reports INTEGER;
    training_status INTEGER;
    vulnerability INTEGER;
BEGIN
    -- Get failed phishing tests
    failed_tests := COALESCE(NEW.phishing_tests_failed, 0);
    
    -- Count reports in last 30 days
    SELECT COUNT(*) INTO recent_reports
    FROM reports
    WHERE user_id = NEW.id
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Training status
    training_status := CASE 
        WHEN NEW.training_completed THEN 0
        ELSE 20
    END;
    
    -- Calculate vulnerability score (0-100, higher = more vulnerable)
    vulnerability := LEAST(100, 
        (failed_tests * 15) + 
        (recent_reports * 5) + 
        training_status
    );
    
    NEW.vulnerability_score := vulnerability;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate vulnerability score
CREATE TRIGGER trg_calculate_vulnerability
BEFORE UPDATE OF phishing_tests_failed, phishing_tests_passed, training_completed ON users
FOR EACH ROW
EXECUTE FUNCTION calculate_user_vulnerability();

-- Function: Generate Tracking Token for Guest Reports
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_token IS NULL OR NEW.tracking_token = '' THEN
        NEW.tracking_token := 'GB-' || 
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate tracking token for guest reports
CREATE TRIGGER trg_generate_tracking_token
BEFORE INSERT ON guest_reports
FOR EACH ROW
EXECUTE FUNCTION generate_tracking_token();

-- Function: Update First Response Time for Inquiries
CREATE OR REPLACE FUNCTION update_inquiry_first_response()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_admin_response = true THEN
        UPDATE user_inquiries
        SET 
            first_response_at = COALESCE(first_response_at, NOW()),
            status = CASE 
                WHEN status = 'new' THEN 'in_progress'
                ELSE status
            END
        WHERE id = NEW.inquiry_id
        AND first_response_at IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Track first admin response
CREATE TRIGGER trg_inquiry_first_response
AFTER INSERT ON inquiry_responses
FOR EACH ROW
EXECUTE FUNCTION update_inquiry_first_response();

-- ============================================================================
-- SEED DATA FOR TESTING
-- ============================================================================

-- Insert sample threat indicators
INSERT INTO threat_indicators (indicator_type, indicator_value, threat_type, severity, source)
VALUES 
    ('domain', 'phishing-test.com', 'phishing', 'high', 'manual'),
    ('url', 'http://malicious-site.xyz/login', 'phishing', 'critical', 'automated'),
    ('ip', '185.220.101.1', 'malware', 'high', 'external_feed'),
    ('email', 'scammer@fake-domain.com', 'scam', 'medium', 'manual')
ON CONFLICT DO NOTHING;

-- Insert sample IP intelligence
INSERT INTO ip_intelligence (ip_address, country, threat_level, reputation_score, is_blacklisted)
VALUES 
    ('185.220.101.1', 'Russia', 'dangerous', 10, true),
    ('8.8.8.8', 'United States', 'safe', 95, false),
    ('203.0.113.1', 'Unknown', 'suspicious', 40, false)
ON CONFLICT (ip_address) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (Adjust based on your roles)
-- ============================================================================

-- Grant permissions to application user (adjust role name as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ GuardBulldog V2 Database Schema Update Complete!';
    RAISE NOTICE '📊 New Tables Created: 8';
    RAISE NOTICE '🔧 Existing Tables Updated: 2';
    RAISE NOTICE '📈 New Indexes Created: 25+';
    RAISE NOTICE '🔍 New Views Created: 3';
    RAISE NOTICE '⚡ New Functions/Triggers: 6';
    RAISE NOTICE '🛡️ System Ready for Enhanced Features!';
END $$;
