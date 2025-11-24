import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuestReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: '',
    suspicious_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trackingToken, setTrackingToken] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/guest/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTrackingToken(data.tracking_token);
        setFormData({
          email: '',
          subject: '',
          description: '',
          suspicious_url: ''
        });
      } else {
        setError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingToken = () => {
    navigator.clipboard.writeText(trackingToken);
    alert('Tracking token copied to clipboard!');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Report Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for helping keep our community safe.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2 font-semibold">
                  Your Tracking Number:
                </p>
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded border border-gray-300">
                  <code className="text-lg font-mono text-blue-600">
                    {trackingToken}
                  </code>
                  <button
                    onClick={copyTrackingToken}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Save this number to check your report status later.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/track-report')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center"
                >
                  Track Your Report
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setTrackingToken('');
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Report Suspicious Email
          </h1>
          <p className="text-lg text-gray-600">
            No account needed • Quick & Anonymous • Secure
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Help Protect Our Community
              </h3>
              <p className="text-sm text-blue-700">
                You'll receive a tracking number to check your report status. No account required!
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide your email if you'd like updates on your report.
              </p>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Subject line of the suspicious email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Describe what makes this email suspicious. Include sender information, suspicious links, or requests for personal information."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="mt-1 text-xs text-gray-500">
                Be as detailed as possible to help us investigate.
              </p>
            </div>

            {/* Suspicious URL */}
            <div>
              <label htmlFor="suspicious_url" className="block text-sm font-medium text-gray-700 mb-2">
                Suspicious URL/Link <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="url"
                id="suspicious_url"
                name="suspicious_url"
                value={formData.suspicious_url}
                onChange={handleChange}
                placeholder="https://suspicious-website.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="mt-1 text-xs text-gray-500">
                If the email contains suspicious links, paste one here.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Report
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already submitted a report?{' '}
              <button
                onClick={() => navigate('/track-report')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Track your report here
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need an account for more features?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestReport;
