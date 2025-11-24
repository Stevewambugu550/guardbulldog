const crypto = require('crypto');

// In-memory storage for guest reports (no database required)
let guestReports = [];
let nextReportId = 1;

/**
 * Guest Report Controller
 * Handles anonymous phishing report submissions without authentication
 */

// Generate unique tracking token
const generateTrackingToken = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `GB-${date}-${random}`;
};

// Submit guest report
exports.submitGuestReport = async (req, res) => {
    try {
        const { email, subject, description, suspicious_url, attachment_path } = req.body;
        
        // Get client IP address
        const ip_address = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const user_agent = req.headers['user-agent'];
        const session_id = req.sessionID || crypto.randomBytes(16).toString('hex');
        
        // Validate required fields
        if (!subject || !description) {
            return res.status(400).json({
                success: false,
                message: 'Subject and description are required'
            });
        }
        
        // Check rate limiting - max 5 submissions per IP per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentSubmissions = guestReports.filter(report => 
            report.ip_address === ip_address && 
            new Date(report.submitted_at) > oneHourAgo
        );
        
        if (recentSubmissions.length >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Maximum 5 submissions per hour. Please try again later.'
            });
        }
        
        // Generate tracking token
        const tracking_token = generateTrackingToken();
        
        // Create guest report in memory
        const report = {
            id: nextReportId++,
            tracking_token,
            email,
            subject,
            description,
            suspicious_url,
            attachment_path,
            ip_address,
            session_id,
            user_agent,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        guestReports.push(report);
        
        // Log the submission
        console.log(`Guest report submitted: ${tracking_token} from IP: ${ip_address}`);
        
        res.status(201).json({
            success: true,
            message: 'Report submitted successfully! Save your tracking token to check status.',
            tracking_token: report.tracking_token,
            data: {
                tracking_token: report.tracking_token,
                report_id: report.id,
                submitted_at: report.submitted_at,
                status_check_url: `/track/${report.tracking_token}`
            }
        });
        
    } catch (error) {
        console.error('Error submitting guest report:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting report. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Track report status by tracking token
exports.trackReport = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token || !token.startsWith('GB-')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tracking token format'
            });
        }
        
        // Find report in memory
        const report = guestReports.find(r => r.tracking_token === token);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found. Please check your tracking token.'
            });
        }
        
        // Calculate time elapsed
        const createdDate = new Date(report.submitted_at);
        const now = new Date();
        const hoursElapsed = Math.floor((now - createdDate) / (1000 * 60 * 60));
        
        res.json({
            success: true,
            data: {
                tracking_token: report.tracking_token,
                subject: report.subject,
                description: report.description,
                suspicious_url: report.suspicious_url,
                status: report.status,
                submitted_at: report.submitted_at,
                resolved_at: report.resolved_at,
                hours_elapsed: hoursElapsed,
                status_message: getStatusMessage(report.status)
            }
        });
        
    } catch (error) {
        console.error('Error tracking report:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving report status'
        });
    }
};

// Get all guest reports (admin only)
exports.getAllGuestReports = async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        
        // Filter reports by status if provided
        let filteredReports = status 
            ? guestReports.filter(r => r.status === status)
            : [...guestReports];
        
        // Sort by submitted_at descending
        filteredReports.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        
        // Apply pagination
        const total = filteredReports.length;
        const paginatedReports = filteredReports.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
        
        res.json({
            success: true,
            data: paginatedReports,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Error fetching guest reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving reports'
        });
    }
};

// Update guest report status (admin only)
exports.updateGuestReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        
        if (!['submitted', 'investigating', 'resolved', 'false_positive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: submitted, investigating, resolved, or false_positive'
            });
        }
        
        // Find and update report in memory
        const reportIndex = guestReports.findIndex(r => r.id === parseInt(id));
        
        if (reportIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        guestReports[reportIndex].status = status;
        guestReports[reportIndex].updated_at = new Date().toISOString();
        
        if (status === 'resolved') {
            guestReports[reportIndex].resolved_at = new Date().toISOString();
        }
        
        if (admin_notes) {
            guestReports[reportIndex].admin_notes = admin_notes;
        }
        
        res.json({
            success: true,
            message: 'Report status updated successfully',
            data: guestReports[reportIndex]
        });
        
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating report'
        });
    }
};

// Helper function to get status message
function getStatusMessage(status) {
    const messages = {
        'submitted': 'Your report has been submitted and is pending review.',
        'investigating': 'Our security team is currently investigating your report.',
        'resolved': 'Your report has been resolved. Thank you for helping keep our community safe!',
        'false_positive': 'After investigation, this email appears to be legitimate.'
    };
    return messages[status] || 'Status unknown';
}

module.exports = exports;
