// In-memory storage for user inquiries
let inquiries = [];
let nextId = 1;

// Submit inquiry
exports.submitInquiry = async (req, res) => {
  try {
    const { subject, message, priority, relatedReportId } = req.body;
    const userId = req.user.id;
    
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }
    
    const inquiry = {
      id: nextId++,
      userId,
      subject,
      message,
      priority: priority || 'normal',
      relatedReportId: relatedReportId || null,
      status: 'open',
      response: null,
      respondedBy: null,
      createdAt: new Date().toISOString(),
      respondedAt: null
    };
    
    inquiries.push(inquiry);
    
    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting inquiry'
    });
  }
};

// Get user inquiries
exports.getUserInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const userInquiries = inquiries.filter(i => i.userId === userId);
    
    res.json({
      success: true,
      inquiries: userInquiries,
      count: userInquiries.length
    });
  } catch (error) {
    console.error('Error getting inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inquiries'
    });
  }
};

// Get all inquiries (admin)
exports.getAllInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filteredInquiries = [...inquiries];
    
    if (status) {
      filteredInquiries = filteredInquiries.filter(i => i.status === status);
    }
    
    filteredInquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      inquiries: filteredInquiries,
      count: filteredInquiries.length
    });
  } catch (error) {
    console.error('Error getting inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inquiries'
    });
  }
};

// Respond to inquiry (admin)
exports.respondToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const adminId = req.user.id;
    
    const inquiryIndex = inquiries.findIndex(i => i.id === parseInt(id));
    
    if (inquiryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }
    
    inquiries[inquiryIndex].response = response;
    inquiries[inquiryIndex].respondedBy = adminId;
    inquiries[inquiryIndex].respondedAt = new Date().toISOString();
    inquiries[inquiryIndex].status = 'resolved';
    
    res.json({
      success: true,
      message: 'Response sent successfully',
      inquiry: inquiries[inquiryIndex]
    });
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending response'
    });
  }
};

module.exports = exports;
