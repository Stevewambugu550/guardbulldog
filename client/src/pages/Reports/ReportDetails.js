import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/reports/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setReport(data.report || data);
        } else {
          setError({ message: 'Report not found' });
        }
      } catch (err) {
        setError({ message: 'Failed to load report' });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Report</h3>
        <p className="text-gray-500 mb-4">{error?.message || 'Report not found'}</p>
        <Link to="/app/my-reports" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Tracking Number */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/app/my-reports"
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono font-bold">
                  {report.trackingNumber || `RPT-${String(report.id).padStart(4, '0')}`}
                </span>
              </div>
              <h1 className="text-2xl font-bold">Report Details</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
              report.status === 'confirmed' ? 'bg-red-100 text-red-800' :
              report.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
              'bg-white/20 text-white'
            }`}>
              {(report.status || 'pending').replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Threat Level */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
          Threat Assessment
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">Threat Level:</span>
          <span className={`text-lg font-bold ${
            (report.severity === 'critical' || report.severity === 'high') ? 'text-red-600' :
            report.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {(report.severity || 'medium').toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className={`h-4 rounded-full transition-all ${
            (report.severity === 'critical' || report.severity === 'high') ? 'bg-red-500' :
            report.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`} style={{ width: report.severity === 'critical' ? '100%' : report.severity === 'high' ? '75%' : report.severity === 'medium' ? '50%' : '25%' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {report.severity === 'critical' || report.severity === 'high' 
            ? '⚠️ This report requires immediate attention' 
            : report.severity === 'medium' 
            ? '🔍 This report is under review' 
            : '✅ Low risk - continue to monitor'}
        </p>
      </div>

      {/* Report Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Subject</label>
              <p className="text-gray-900 font-medium">{report.subject || report.emailSubject || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Sender Email</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded">{report.senderEmail || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Report Type</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium uppercase ${
                report.reportType === 'phishing' ? 'bg-red-100 text-red-700' :
                report.reportType === 'malware' ? 'bg-purple-100 text-purple-700' :
                report.reportType === 'spam' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {report.reportType || 'suspicious'}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium uppercase ${
                report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                report.status === 'confirmed' ? 'bg-red-100 text-red-700' :
                report.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {(report.status || 'pending').replace('_', ' ')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Submitted</label>
              <p className="text-gray-900">{report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
              <p className="text-gray-900">{report.updatedAt ? new Date(report.updatedAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {report.analysisResults && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Analysis Results
            </h2>
          </div>
          <div className="space-y-4">
            {report.analysisResults.riskScore !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        report.analysisResults.riskScore >= 80 ? 'bg-red-500' :
                        report.analysisResults.riskScore >= 60 ? 'bg-orange-500' :
                        report.analysisResults.riskScore >= 30 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${report.analysisResults.riskScore}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {report.analysisResults.riskScore}/100
                  </span>
                </div>
              </div>
            )}

            {report.analysisResults.verdict && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verdict</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  report.analysisResults.verdict === 'malicious' ? 'bg-red-100 text-red-800' :
                  report.analysisResults.verdict === 'suspicious' ? 'bg-orange-100 text-orange-800' :
                  report.analysisResults.verdict === 'safe' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.analysisResults.verdict}
                </span>
              </div>
            )}

            {report.analysisResults.indicators && report.analysisResults.indicators.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threat Indicators</label>
                <div className="space-y-2">
                  {report.analysisResults.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        indicator.severity === 'critical' ? 'bg-red-500' :
                        indicator.severity === 'high' ? 'bg-orange-500' :
                        indicator.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {indicator.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">{indicator.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        indicator.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        indicator.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        indicator.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {indicator.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.analysisResults.analyzedAt && (
              <div className="text-sm text-gray-500">
                Analyzed {report.analysisResults.analyzedBy === 'system' ? 'automatically' : `by ${report.analysisResults.analyzedBy}`} on {new Date(report.analysisResults.analyzedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Content */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
          Email Content
        </h3>
        <div className="space-y-4">
          {(report.emailBody || report.email_body) ? (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Message Body</label>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-sm text-gray-900">
                  {report.emailBody || report.email_body}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No email content provided</p>
            </div>
          )}

          {(report.emailHeaders || report.email_headers) && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Email Headers</label>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                  {report.emailHeaders || report.email_headers}
                </pre>
              </div>
            </div>
          )}

          {(report.suspiciousUrls || report.suspicious_urls) && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Suspicious URLs</label>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <pre className="whitespace-pre-wrap text-sm text-red-700 font-mono">
                  {typeof report.suspiciousUrls === 'string' ? report.suspiciousUrls : JSON.stringify(report.suspiciousUrls, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      {report.attachments && report.attachments.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
          </div>
          <div className="space-y-2">
            {report.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {attachment.mimetype} • {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Secured</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      {report.adminNotes && report.adminNotes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Admin Notes
            </h2>
          </div>
          <div className="space-y-4">
            {report.adminNotes.map((note, index) => (
              <div key={index} className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-900">{note.note}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {new Date(note.addedAt).toLocaleString()}
                  {note.addedBy && (
                    <>
                      <span className="mx-1">•</span>
                      <UserIcon className="h-3 w-3 mr-1" />
                      {note.addedBy.firstName} {note.addedBy.lastName}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link
          to="/app/my-reports"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to My Reports
        </Link>
        <div className="text-sm text-gray-500">
          Report ID: {report.id} | {report.trackingNumber || `RPT-${String(report.id).padStart(4, '0')}`}
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
