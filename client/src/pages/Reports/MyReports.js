import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    reportType: '',
    search: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reports/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || data || []);
      } else {
        // If no reports or error, set empty array
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.reportType && report.reportType !== filters.reportType) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        report.emailSubject?.toLowerCase().includes(searchLower) ||
        report.senderEmail?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      investigating: 'badge-investigating',
      confirmed: 'badge-confirmed',
      resolved: 'badge-resolved',
      false_positive: 'badge-false-positive'
    };
    return badges[status] || 'badge-pending';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'badge-critical'
    };
    return badges[severity] || 'badge-medium';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600">Track the status of your submitted phishing reports</p>
        </div>
        <Link
          to="/app/report-phishing"
          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition flex items-center shadow-sm"
        >
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="confirmed">Confirmed</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
          <div>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="form-select"
            >
              <option value="">All Types</option>
              <option value="phishing">Phishing</option>
              <option value="spam">Spam</option>
              <option value="malware">Malware</option>
              <option value="suspicious">Suspicious</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500 mb-6">
            {filters.search || filters.status || filters.reportType
              ? "No reports match your current filters."
              : "You haven't submitted any reports yet. Help protect our community!"}
          </p>
          <Link to="/app/report-phishing" className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition inline-flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <div key={report._id || report.id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header with Tracking Number */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-mono font-bold">
                    {report.trackingNumber || `RPT-${String(report.id).padStart(4, '0')}`}
                  </span>
                  <span className="text-white/80 text-sm">
                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    report.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                    report.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(report.status || 'pending').replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              {/* Report Content */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 truncate">
                      {report.subject || report.emailSubject || 'Suspicious Email Report'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-24">Sender:</span>
                        <span className="text-gray-900 font-medium truncate">{report.senderEmail || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-24">Type:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          report.reportType === 'phishing' ? 'bg-red-100 text-red-700' :
                          report.reportType === 'malware' ? 'bg-purple-100 text-purple-700' :
                          report.reportType === 'spam' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {report.reportType || 'suspicious'}
                        </span>
                      </div>
                    </div>

                    {/* Threat Level Bar */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Threat Level</span>
                        <span className={`text-sm font-bold ${
                          (report.severity === 'critical' || report.severity === 'high') ? 'text-red-600' :
                          report.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {(report.severity || 'medium').toUpperCase()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${
                          (report.severity === 'critical' || report.severity === 'high') ? 'bg-red-500' :
                          report.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} style={{ width: report.severity === 'critical' ? '100%' : report.severity === 'high' ? '75%' : report.severity === 'medium' ? '50%' : '25%' }}></div>
                      </div>
                    </div>

                    {/* Email Preview */}
                    {report.emailBody && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 line-clamp-2">{report.emailBody.substring(0, 150)}...</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <Link
                      to={`/app/reports/${report._id || report.id}`}
                      className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Count */}
      {filteredReports.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default MyReports;
