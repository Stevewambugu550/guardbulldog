// In-memory storage for reports (no database required)
let reports = [];
let nextId = 1;

const Report = {
  async create(report) {
    const { reportedBy, emailSubject, senderEmail, emailBody, reportType, suspiciousLinks, attachments } = report;
    const newReport = {
      id: nextId++,
      reportedBy,
      emailSubject,
      senderEmail,
      emailBody,
      reportType,
      suspiciousLinks,
      attachments,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    reports.push(newReport);
    return newReport;
  },

  async findById(id) {
    return reports.find(r => r.id === parseInt(id));
  },

  async findByUserId(userId, filters = {}) {
    let userReports = reports.filter(r => r.reportedBy === parseInt(userId));
    
    if (filters.status) {
      userReports = userReports.filter(r => r.status === filters.status);
    }
    
    if (filters.reportType) {
      userReports = userReports.filter(r => r.reportType === filters.reportType);
    }
    
    userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filters.limit) {
      userReports = userReports.slice(0, filters.limit);
    }
    
    return userReports;
  },

  async findAll(filters = {}) {
    let allReports = [...reports];
    
    if (filters.status) {
      allReports = allReports.filter(r => r.status === filters.status);
    }
    
    if (filters.reportType) {
      allReports = allReports.filter(r => r.reportType === filters.reportType);
    }
    
    if (filters.startDate) {
      allReports = allReports.filter(r => new Date(r.createdAt) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      allReports = allReports.filter(r => new Date(r.createdAt) <= new Date(filters.endDate));
    }
    
    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filters.offset) {
      allReports = allReports.slice(filters.offset);
    }
    
    if (filters.limit) {
      allReports = allReports.slice(0, filters.limit);
    }
    
    return allReports;
  },

  async updateStatus(id, status, updatedBy) {
    const reportIndex = reports.findIndex(r => r.id === parseInt(id));
    if (reportIndex === -1) return null;
    
    reports[reportIndex].status = status;
    reports[reportIndex].updatedBy = updatedBy;
    reports[reportIndex].updatedAt = new Date().toISOString();
    
    return reports[reportIndex];
  },

  async addNote(reportId, note, addedBy) {
    const reportIndex = reports.findIndex(r => r.id === parseInt(reportId));
    if (reportIndex === -1) return null;
    
    if (!reports[reportIndex].notes) {
      reports[reportIndex].notes = [];
    }
    
    const newNote = {
      id: Date.now(),
      reportId: parseInt(reportId),
      note,
      addedBy,
      createdAt: new Date().toISOString()
    };
    
    reports[reportIndex].notes.push(newNote);
    return newNote;
  },

  async getNotes(reportId) {
    const report = reports.find(r => r.id === parseInt(reportId));
    return report?.notes || [];
  },

  async count(filters = {}) {
    let filtered = [...reports];
    
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    if (filters.reportType) {
      filtered = filtered.filter(r => r.reportType === filters.reportType);
    }
    
    if (filters.reportedBy) {
      filtered = filtered.filter(r => r.reportedBy === parseInt(filters.reportedBy));
    }
    
    return filtered.length;
  },

  async getStats() {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      investigating: reports.filter(r => r.status === 'investigating').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      false_positive: reports.filter(r => r.status === 'false_positive').length,
      phishing: reports.filter(r => r.reportType === 'phishing').length,
      spam: reports.filter(r => r.reportType === 'spam').length,
      malware: reports.filter(r => r.reportType === 'malware').length
    };
  },

  async getTrending(limit = 10) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentReports = reports.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
    
    const grouped = {};
    recentReports.forEach(r => {
      if (r.senderEmail) {
        grouped[r.senderEmail] = (grouped[r.senderEmail] || 0) + 1;
      }
    });
    
    return Object.entries(grouped)
      .map(([senderEmail, count]) => ({ senderEmail, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};

module.exports = Report;
