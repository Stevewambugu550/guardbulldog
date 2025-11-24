const pool = require('../config/database');
const axios = require('axios');

/**
 * IP Intelligence Controller
 * Handles IP address geolocation, reputation, and threat analysis
 */

// Get IP information from IPinfo.io API
async function getIPInfo(ipAddress) {
    try {
        const apiKey = process.env.IPINFO_API_KEY;
        if (!apiKey) {
            console.warn('IPinfo API key not configured');
            return null;
        }
        
        const response = await axios.get(`https://ipinfo.io/${ipAddress}?token=${apiKey}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching IP info:', error.message);
        return null;
    }
}

// Calculate threat level based on various factors
function calculateThreatLevel(reportCount, isBlacklisted, reputationScore) {
    if (isBlacklisted || reportCount > 10) return 'dangerous';
    if (reportCount > 5 || reputationScore < 30) return 'suspicious';
    if (reportCount > 0 || reputationScore < 60) return 'unknown';
    return 'safe';
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
        
        // Check if IP exists in database
        let ipData = await pool.query(
            'SELECT * FROM ip_intelligence WHERE ip_address = $1',
            [address]
        );
        
        if (ipData.rows.length > 0) {
            // Update last_seen
            await pool.query(
                'UPDATE ip_intelligence SET last_seen = NOW(), updated_at = NOW() WHERE ip_address = $1',
                [address]
            );
            
            return res.json({
                success: true,
                data: ipData.rows[0],
                source: 'database'
            });
        }
        
        // Fetch from IPinfo API
        const ipInfo = await getIPInfo(address);
        
        if (!ipInfo) {
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch IP information'
            });
        }
        
        // Insert new IP intelligence record
        const result = await pool.query(
            `INSERT INTO ip_intelligence 
             (ip_address, country, city, region, isp, threat_level, reputation_score, report_count)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                address,
                ipInfo.country || 'Unknown',
                ipInfo.city || 'Unknown',
                ipInfo.region || 'Unknown',
                ipInfo.org || 'Unknown',
                'unknown',
                50, // Default neutral score
                0
            ]
        );
        
        res.json({
            success: true,
            data: result.rows[0],
            source: 'api',
            raw_data: ipInfo
        });
        
    } catch (error) {
        console.error('Error analyzing IP:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing IP address'
        });
    }
};

// Get IP reputation
exports.getIPReputation = async (req, res) => {
    try {
        const { address } = req.params;
        
        const result = await pool.query(
            `SELECT ip_address, threat_level, reputation_score, report_count, 
                    is_blacklisted, last_seen
             FROM ip_intelligence 
             WHERE ip_address = $1`,
            [address]
        );
        
        if (result.rows.length === 0) {
            // Automatically analyze if not in database
            return exports.analyzeIP(req, res);
        }
        
        const ipData = result.rows[0];
        
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
        
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        if (threat_level) {
            updates.push(`threat_level = $${paramIndex++}`);
            values.push(threat_level);
        }
        
        if (reputation_score !== undefined) {
            updates.push(`reputation_score = $${paramIndex++}`);
            values.push(reputation_score);
        }
        
        if (is_blacklisted !== undefined) {
            updates.push(`is_blacklisted = $${paramIndex++}`);
            values.push(is_blacklisted);
        }
        
        if (notes) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No updates provided'
            });
        }
        
        updates.push(`updated_at = NOW()`);
        values.push(address);
        
        const query = `UPDATE ip_intelligence SET ${updates.join(', ')} 
                      WHERE ip_address = $${paramIndex} RETURNING *`;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'IP address not found in database'
            });
        }
        
        res.json({
            success: true,
            message: 'IP reputation updated successfully',
            data: result.rows[0]
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
        
        let query = `
            SELECT ip_address, country, city, threat_level, reputation_score, 
                   report_count, is_blacklisted, last_seen
            FROM ip_intelligence
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (threat_level) {
            query += ` AND threat_level = $${paramIndex++}`;
            params.push(threat_level);
        }
        
        if (country) {
            query += ` AND country = $${paramIndex++}`;
            params.push(country);
        }
        
        query += ` ORDER BY report_count DESC, reputation_score ASC LIMIT $${paramIndex}`;
        params.push(limit);
        
        const result = await pool.query(query, params);
        
        // Get statistics
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_ips,
                COUNT(*) FILTER (WHERE threat_level = 'dangerous') as dangerous_count,
                COUNT(*) FILTER (WHERE threat_level = 'suspicious') as suspicious_count,
                COUNT(*) FILTER (WHERE is_blacklisted = true) as blacklisted_count,
                AVG(reputation_score)::numeric(10,2) as avg_reputation
            FROM ip_intelligence
        `);
        
        res.json({
            success: true,
            data: result.rows,
            statistics: stats.rows[0]
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
        const result = await pool.query(`
            SELECT country, 
                   COUNT(*) as total_ips,
                   COUNT(*) FILTER (WHERE threat_level = 'dangerous') as dangerous_count,
                   COUNT(*) FILTER (WHERE threat_level = 'suspicious') as suspicious_count,
                   SUM(report_count) as total_reports,
                   AVG(reputation_score)::numeric(10,2) as avg_reputation
            FROM ip_intelligence
            WHERE country IS NOT NULL AND country != 'Unknown'
            GROUP BY country
            ORDER BY total_reports DESC, dangerous_count DESC
            LIMIT 50
        `);
        
        res.json({
            success: true,
            data: result.rows
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
