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
            <div key={report._id || report.id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate pr-4">
                      {report.emailSubject}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={getStatusBadge(report.status)}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className={getSeverityBadge(report.severity)}>
                        {report.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">From:</span>
                      <span className="truncate">{report.senderEmail}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Type:</span>
                      <span className="capitalize">{report.reportType}</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium mr-2">Submitted:</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>

                    {report.analysisResults?.riskScore && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Risk Score:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                report.analysisResults.riskScore >= 80 ? 'bg-red-500' :
                                report.analysisResults.riskScore >= 60 ? 'bg-orange-500' :
                                report.analysisResults.riskScore >= 30 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${report.analysisResults.riskScore}%` }}
                            />
                          </div>
                          <span>{report.analysisResults.riskScore}/100</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <Link
                    to={`/app/reports/${report._id || report.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
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
