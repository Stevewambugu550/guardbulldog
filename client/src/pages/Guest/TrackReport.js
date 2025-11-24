import React, { useState } from 'react';
import { Search, AlertCircle, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackReport = () => {
  const navigate = useNavigate();
  const [trackingToken, setTrackingToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/guest/track/${trackingToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Report not found. Please check your tracking number.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'investigating':
        return <Search className="h-6 w-6 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'false_positive':
        return <XCircle className="h-6 w-6 text-gray-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'investigating':
        return 'Under Investigation';
      case 'resolved':
        return 'Resolved';
      case 'false_positive':
        return 'False Positive';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Search className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Track Your Report
          </h1>
          <p className="text-lg text-gray-600">
            Enter your tracking number to check the status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="trackingToken" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="trackingToken"
                  value={trackingToken}
                  onChange={(e) => setTrackingToken(e.target.value)}
                  placeholder="GB-20251124-XXXXXXXX"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Track
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Your tracking number was provided when you submitted your report.
              </p>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Report Details */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-xl p-8 animate-fadeIn">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="mr-4">
                  {getStatusIcon(reportData.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Report Status
                  </h2>
                  <p className="text-gray-600">
                    Tracking #: <span className="font-mono font-semibold">{reportData.tracking_token}</span>
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(reportData.status)}`}>
                {getStatusText(reportData.status)}
              </span>
            </div>

            {/* Report Information */}
            <div className="space-y-6">
              {/* Subject */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {reportData.subject}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                  {reportData.description}
                </p>
              </div>

              {/* Suspicious URL */}
              {reportData.suspicious_url && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Suspicious URL</h3>
                  <p className="text-blue-600 bg-gray-50 p-3 rounded-lg font-mono text-sm break-all">
                    {reportData.suspicious_url}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Submitted</h3>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {formatDate(reportData.submitted_at)}
                  </p>
                </div>
                {reportData.hours_elapsed !== undefined && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Elapsed</h3>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {reportData.hours_elapsed < 1 
                        ? 'Less than 1 hour ago'
                        : reportData.hours_elapsed < 24
                        ? `${Math.floor(reportData.hours_elapsed)} hours ago`
                        : `${Math.floor(reportData.hours_elapsed / 24)} days ago`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Admin Notes (if resolved) */}
              {reportData.admin_notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Administrator Notes
                  </h3>
                  <p className="text-blue-800 text-sm">
                    {reportData.admin_notes}
                  </p>
                </div>
              )}

              {/* Status Messages */}
              {reportData.status === 'investigating' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Under Investigation:</strong> Our security team is currently reviewing your report. We'll update the status once the investigation is complete.
                  </p>
                </div>
              )}

              {reportData.status === 'resolved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Resolved:</strong> Your report has been investigated and appropriate action has been taken. Thank you for helping keep our community safe!
                  </p>
                </div>
              )}

              {reportData.status === 'false_positive' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 text-sm">
                    <strong>False Positive:</strong> After investigation, this email appears to be legitimate. Thank you for your vigilance in reporting suspicious activity.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setReportData(null);
                  setTrackingToken('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
              >
                Track Another Report
              </button>
              <button
                onClick={() => navigate('/guest-report')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Submit New Report
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!reportData && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Don't have a tracking number?
            </p>
            <button
              onClick={() => navigate('/guest-report')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Submit a new report →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackReport;
