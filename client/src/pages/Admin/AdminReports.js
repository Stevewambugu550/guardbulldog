import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

const AdminReports = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    reportType: '',
    severity: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [selectedReports, setSelectedReports] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['adminReports', currentPage, filters],
    () => adminAPI.getAllReports({
      page: currentPage,
      limit: 20,
      ...filters
    }).then(res => res.data),
    {
      keepPreviousData: true
    }
  );

  const bulkUpdateMutation = useMutation(
    ({ reportIds, status, notes }) => adminAPI.bulkUpdateReports(reportIds, { status, notes }),
    {
      onSuccess: (response) => {
        toast.success(response.data.message || response.data.msg || 'Reports updated successfully');
        setSelectedReports([]);
        setShowBulkActions(false);
        queryClient.invalidateQueries('adminReports');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update reports');
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === data?.reports?.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(data?.reports?.map(report => report.id || report._id).filter(Boolean) || []);
    }
  };

  const handleBulkUpdate = (status, notes = '') => {
    if (selectedReports.length === 0) {
      toast.error('Please select reports to update');
      return;
    }
    bulkUpdateMutation.mutate({ reportIds: selectedReports, status, notes });
  };

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

  if (isLoading) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
        <p className="text-gray-500">Unable to load reports. Please try again.</p>
      </div>
    );
  }

  const { reports = [], pagination = {} } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Reports</h1>
          <p className="text-gray-600">Review and process phishing reports from users</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedReports.length > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="btn-secondary flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedReports.length})
            </button>
          )}
          <a
            href="/api/admin/reports/export?format=csv"
            className="btn-primary"
            download
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedReports.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkUpdate('investigating', 'Bulk updated to investigating status')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Mark Investigating
              </button>
              <button
                onClick={() => handleBulkUpdate('confirmed', 'Bulk confirmed as phishing')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Confirm Threat
              </button>
              <button
                onClick={() => handleBulkUpdate('false_positive', 'Bulk marked as false positive')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                False Positive
              </button>
              <button
                onClick={() => setShowBulkActions(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
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
          <div>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="form-select"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="form-input"
              placeholder="Start Date"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500">No reports match your current filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reports.length && reports.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => {
                  const reportId = report.id || report._id;
                  const subject = report.emailSubject || report.subject || 'Suspicious Email Report';
                  const senderEmail = report.senderEmail || report.sender_email || 'Unknown sender';
                  const reporterName = report.reportedBy
                    ? `${report.reportedBy.firstName || ''} ${report.reportedBy.lastName || ''}`.trim()
                    : `${report.firstName || ''} ${report.lastName || ''}`.trim();
                  const reporterEmail = report.reportedBy?.email || report.reporter_email || '-';

                  return (
                  <tr key={reportId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(reportId)}
                        onChange={() => handleSelectReport(reportId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {subject}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          From: {senderEmail}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">
                            {report.reportType}
                          </span>
                          <span className={getSeverityBadge(report.severity)}>
                            {report.severity}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reporterName || 'Guest Reporter'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reporterEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(report.status)}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.analysisResults?.riskScore ? (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
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
                          <span className="text-sm text-gray-900">
                            {report.analysisResults.riskScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt || report.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/app/reports/${reportId}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span> ({pagination.total} total reports)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
