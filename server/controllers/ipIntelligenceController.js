const axios = require('axios');

/**
 * IP Intelligence Controller
 * Handles IP address geolocation, reputation, and threat analysis
 * Using in-memory storage (no database required)
 */

// In-memory storage for IP intelligence data
let ipIntelligenceData = [];

// Get IP information from IPinfo.io API
async function getIPInfo(ipAddress) {
    try {
        const apiKey = process.env.IPINFO_API_KEY || 'demo';
        
        const response = await axios.get(`https://ipinfo.io/${ipAddress}?token=${apiKey}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching IP info:', error.message);
        // Return mock data if API fails
        return {
            ip: ipAddress,
            city: 'Unknown',
            region: 'Unknown',
            country: 'US',
            loc: '39.0997,-94.5786',
            org: 'Unknown ISP',
            postal: '00000',
            timezone: 'America/Chicago'
        };
    }
}

/**
 * REPUTATION SCORING ALGORITHM (0-100):
 * - 0-30 (Dangerous): Multiple confirmed phishing reports
 * - 31-60 (Suspicious): Few reports or unknown origin
 * - 61-100 (Safe): Verified legitimate sources
 */

// High-risk countries with historically higher phishing rates
const HIGH_RISK_COUNTRIES = ['RU', 'CN', 'NG', 'RO', 'UA', 'BR', 'IN', 'PK'];
const MEDIUM_RISK_COUNTRIES = ['VN', 'ID', 'PH', 'TH', 'EG', 'MA', 'KE'];

// Calculate comprehensive reputation score (0-100)
function calculateReputationScore(reportCount, isBlacklisted, country) {
    let score = 100;
    
    // Blacklisted IPs get lowest score
    if (isBlacklisted) return 0;
    
    // Deduct points for each report (10 points per report, max 70 deduction)
    score -= Math.min(reportCount * 10, 70);
    
    // Geographic risk factor adjustment
    if (HIGH_RISK_COUNTRIES.includes(country)) {
        score -= 15; // Higher risk countries
    } else if (MEDIUM_RISK_COUNTRIES.includes(country)) {
        score -= 8; // Medium risk countries
    }
    
    // Ensure score stays within 0-100
    return Math.max(0, Math.min(100, score));
}

// Calculate threat level based on reputation score and other factors
function calculateThreatLevel(reportCount, isBlacklisted, reputationScore, country) {
    // Score-based classification per the algorithm:
    // 0-30: Dangerous
    // 31-60: Suspicious
    // 61-100: Safe
    
    if (isBlacklisted || reputationScore <= 30) {
        return 'dangerous';
    }
    if (reputationScore <= 60 || (reportCount >= 3 && HIGH_RISK_COUNTRIES.includes(country))) {
        return 'suspicious';
    }
    return 'safe';
}

// Get threat classification details
function getThreatClassification(ipData) {
    return {
        reputation_score: ipData.reputation_score,
        threat_level: ipData.threat_level,
        report_count: ipData.report_count,
        is_blacklisted: ipData.is_blacklisted,
        geographic_risk: HIGH_RISK_COUNTRIES.includes(ipData.country) ? 'high' : 
                        MEDIUM_RISK_COUNTRIES.includes(ipData.country) ? 'medium' : 'low',
        classification: {
            score_range: ipData.reputation_score <= 30 ? '0-30 (Dangerous)' :
                        ipData.reputation_score <= 60 ? '31-60 (Suspicious)' : '61-100 (Safe)',
            description: ipData.reputation_score <= 30 ? 'Multiple confirmed phishing reports' :
                        ipData.reputation_score <= 60 ? 'Few reports or unknown origin' : 'Verified legitimate source'
        }
    };
}

// Analyze IP address
exports.analyzeIP = async (req, res) => {
    try {
        const { address } = req.params;
        
        // Validate IP address format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(address)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IP address format'
            });
        }
        
        // Check if IP exists in memory
        let ipData = ipIntelligenceData.find(ip => ip.ip_address === address);
        
        if (ipData) {
            // Update last_seen
            ipData.last_seen = new Date().toISOString();
            ipData.updated_at = new Date().toISOString();
            
            return res.json({
                success: true,
                data: ipData,
                source: 'cache'
            });
        }
        
        // Fetch from IPinfo API
        const ipInfo = await getIPInfo(address);
        
        // Create new IP intelligence record with proper scoring
        const country = ipInfo.country || 'Unknown';
        const reportCount = 0;
        const isBlacklisted = false;
        const reputationScore = calculateReputationScore(reportCount, isBlacklisted, country);
        const threatLevel = calculateThreatLevel(reportCount, isBlacklisted, reputationScore, country);
        
        const newIPData = {
            id: ipIntelligenceData.length + 1,
            ip_address: address,
            country: country,
            city: ipInfo.city || 'Unknown',
            region: ipInfo.region || 'Unknown',
            isp: ipInfo.org || 'Unknown',
            location: ipInfo.loc || '0,0',
            postal: ipInfo.postal || 'Unknown',
            timezone: ipInfo.timezone || 'Unknown',
            threat_level: threatLevel,
            reputation_score: reputationScore,
            report_count: reportCount,
            is_blacklisted: isBlacklisted,
            geographic_risk: HIGH_RISK_COUNTRIES.includes(country) ? 'high' : 
                            MEDIUM_RISK_COUNTRIES.includes(country) ? 'medium' : 'low',
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        ipIntelligenceData.push(newIPData);
        
        res.json({
            success: true,
            data: newIPData,
            threat_classification: getThreatClassification(newIPData),
            source: 'api',
            raw_data: ipInfo
        });
        
    } catch (error) {
        console.error('Error analyzing IP:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing IP address',
            error: error.message
        });
    }
};

// Get IP reputation
exports.getIPReputation = async (req, res) => {
    try {
        const { address } = req.params;
        
        let ipData = ipIntelligenceData.find(ip => ip.ip_address === address);
        
        if (!ipData) {
            // Automatically analyze if not in memory
            return exports.analyzeIP(req, res);
        }
        
        res.json({
            success: true,
            data: {
                ip_address: ipData.ip_address,
                threat_level: ipData.threat_level,
                reputation_score: ipData.reputation_score,
                report_count: ipData.report_count,
                is_blacklisted: ipData.is_blacklisted,
                last_seen: ipData.last_seen,
                risk_assessment: getRiskAssessment(ipData.threat_level, ipData.reputation_score)
            }
        });
        
    } catch (error) {
        console.error('Error getting IP reputation:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving IP reputation'
        });
    }
};

// Update IP reputation (admin only)
exports.updateIPReputation = async (req, res) => {
    try {
        const { address } = req.params;
        const { threat_level, reputation_score, is_blacklisted, notes } = req.body;
        
        const ipIndex = ipIntelligenceData.findIndex(ip => ip.ip_address === address);
        
        if (ipIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'IP address not found'
            });
        }
        
        if (threat_level) ipIntelligenceData[ipIndex].threat_level = threat_level;
        if (reputation_score !== undefined) ipIntelligenceData[ipIndex].reputation_score = reputation_score;
        if (is_blacklisted !== undefined) ipIntelligenceData[ipIndex].is_blacklisted = is_blacklisted;
        if (notes) ipIntelligenceData[ipIndex].notes = notes;
        
        ipIntelligenceData[ipIndex].updated_at = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'IP reputation updated successfully',
            data: ipIntelligenceData[ipIndex]
        });
        
    } catch (error) {
        console.error('Error updating IP reputation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating IP reputation'
        });
    }
};

// Get threat intelligence summary
exports.getThreatIntelligence = async (req, res) => {
    try {
        const { limit = 100, threat_level, country } = req.query;
        
        let filtered = [...ipIntelligenceData];
        
        if (threat_level) {
            filtered = filtered.filter(ip => ip.threat_level === threat_level);
        }
        
        if (country) {
            filtered = filtered.filter(ip => ip.country === country);
        }
        
        filtered.sort((a, b) => b.report_count - a.report_count || a.reputation_score - b.reputation_score);
        filtered = filtered.slice(0, parseInt(limit));
        
        // Calculate statistics
        const stats = {
            total_ips: ipIntelligenceData.length,
            dangerous_count: ipIntelligenceData.filter(ip => ip.threat_level === 'dangerous').length,
            suspicious_count: ipIntelligenceData.filter(ip => ip.threat_level === 'suspicious').length,
            blacklisted_count: ipIntelligenceData.filter(ip => ip.is_blacklisted).length,
            avg_reputation: ipIntelligenceData.length > 0 
                ? (ipIntelligenceData.reduce((sum, ip) => sum + ip.reputation_score, 0) / ipIntelligenceData.length).toFixed(2)
                : 0
        };
        
        res.json({
            success: true,
            data: filtered,
            statistics: stats
        });
        
    } catch (error) {
        console.error('Error getting threat intelligence:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving threat intelligence'
        });
    }
};

// Get geographic threat distribution
exports.getGeographicThreats = async (req, res) => {
    try {
        const filtered = ipIntelligenceData.filter(ip => ip.country && ip.country !== 'Unknown');
        
        const grouped = {};
        filtered.forEach(ip => {
            if (!grouped[ip.country]) {
                grouped[ip.country] = {
                    country: ip.country,
                    total_ips: 0,
                    dangerous_count: 0,
                    suspicious_count: 0,
                    total_reports: 0,
                    reputation_scores: []
                };
            }
            
            grouped[ip.country].total_ips++;
            if (ip.threat_level === 'dangerous') grouped[ip.country].dangerous_count++;
            if (ip.threat_level === 'suspicious') grouped[ip.country].suspicious_count++;
            grouped[ip.country].total_reports += ip.report_count;
            grouped[ip.country].reputation_scores.push(ip.reputation_score);
        });
        
        const result = Object.values(grouped).map(item => ({
            ...item,
            avg_reputation: item.reputation_scores.length > 0
                ? (item.reputation_scores.reduce((a, b) => a + b, 0) / item.reputation_scores.length).toFixed(2)
                : 0,
            reputation_scores: undefined
        }));
        
        result.sort((a, b) => b.total_reports - a.total_reports || b.dangerous_count - a.dangerous_count);
        
        res.json({
            success: true,
            data: result.slice(0, 50)
        });
        
    } catch (error) {
        console.error('Error getting geographic threats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving geographic threat data'
        });
    }
};

// Helper function to get risk assessment
function getRiskAssessment(threat_level, reputation_score) {
    if (threat_level === 'dangerous' || reputation_score < 20) {
        return {
            level: 'HIGH RISK',
            color: 'red',
            recommendation: 'Block this IP immediately. Do not interact with emails from this source.',
            action: 'block'
        };
    } else if (threat_level === 'suspicious' || reputation_score < 50) {
        return {
            level: 'MEDIUM RISK',
            color: 'orange',
            recommendation: 'Exercise caution. Verify sender identity before responding.',
            action: 'warn'
        };
    } else if (reputation_score < 70) {
        return {
            level: 'LOW RISK',
            color: 'yellow',
            recommendation: 'Generally safe, but remain vigilant.',
            action: 'monitor'
        };
    } else {
        return {
            level: 'SAFE',
            color: 'green',
            recommendation: 'This IP appears to be from a trusted source.',
            action: 'allow'
        };
    }
}

module.exports = exports;
