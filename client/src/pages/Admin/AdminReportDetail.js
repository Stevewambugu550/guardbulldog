import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

// Client-side threat analysis engine
const analyzeReport = (report) => {
  const indicators = [];
  let score = 0;

  const subject = (report.subject || report.emailSubject || '').toLowerCase();
  const body = (report.emailBody || '').toLowerCase();
  const sender = (report.senderEmail || '').toLowerCase();
  const combined = subject + ' ' + body;

  // Urgency keywords
  const urgencyWords = ['urgent', 'immediately', 'action required', 'account suspended', 'verify now',
    'act now', 'limited time', 'expires', 'warning', 'alert', 'critical', 'final notice'];
  const foundUrgency = urgencyWords.filter(w => combined.includes(w));
  if (foundUrgency.length > 0) {
    score += Math.min(foundUrgency.length * 10, 30);
    indicators.push({ type: 'Urgency Language', severity: foundUrgency.length > 2 ? 'high' : 'medium', description: `Contains urgency words: "${foundUrgency.slice(0,3).join('", "')}"` });
  }

  // Credential harvesting keywords
  const credWords = ['password', 'username', 'login', 'sign in', 'credentials', 'verify your account',
    'confirm your email', 'update your information', 'bank account', 'credit card', 'ssn', 'social security'];
  const foundCred = credWords.filter(w => combined.includes(w));
  if (foundCred.length > 0) {
    score += Math.min(foundCred.length * 12, 35);
    indicators.push({ type: 'Credential Harvesting', severity: 'high', description: `Requests sensitive info: "${foundCred.slice(0,3).join('", "')}"` });
  }

  // Suspicious links
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = (report.emailBody || '').match(urlPattern) || [];
  const suspiciousUrls = urls.filter(u => {
    const low = u.toLowerCase();
    return low.includes('bit.ly') || low.includes('tinyurl') || low.includes('goo.gl') ||
      low.includes('secure-') || low.includes('verify-') || low.includes('update-') ||
      low.includes('login-') || /\d{4,}\.\w{2,4}/.test(u);
  });
  if (suspiciousUrls.length > 0) {
    score += Math.min(suspiciousUrls.length * 15, 30);
    indicators.push({ type: 'Suspicious URLs', severity: 'critical', description: `Found ${suspiciousUrls.length} suspicious link(s): ${suspiciousUrls[0]}` });
  } else if (urls.length > 0) {
    score += 5;
    indicators.push({ type: 'External Links', severity: 'low', description: `Contains ${urls.length} external link(s)` });
  }

  // Suspicious sender domain
  if (sender) {
    const domain = sender.split('@')[1] || '';
    const suspiciousDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'];
    const legitimateOrgWords = ['bank', 'paypal', 'amazon', 'microsoft', 'apple', 'google', 'irs', 'fedex', 'ups'];
    const claimsLegit = legitimateOrgWords.some(w => combined.includes(w));
    if (claimsLegit && suspiciousDomains.includes(domain)) {
      score += 25;
      indicators.push({ type: 'Sender Spoofing', severity: 'critical', description: `Email claims to be from a legitimate org but sent from ${domain}` });
    } else if (domain && domain.split('.').length > 3) {
      score += 10;
      indicators.push({ type: 'Suspicious Sender Domain', severity: 'medium', description: `Unusual sender domain: ${domain}` });
    }
  }

  // Prize/reward keywords
  const prizeWords = ['winner', 'won', 'prize', 'reward', 'free', 'gift card', 'lottery', 'selected', 'congratulations'];
  const foundPrize = prizeWords.filter(w => combined.includes(w));
  if (foundPrize.length > 0) {
    score += 15;
    indicators.push({ type: 'Reward/Prize Scam', severity: 'medium', description: `Classic prize scam language detected: "${foundPrize.slice(0,2).join('", "')}"` });
  }

  // Threat type override from report
  if (report.reportType === 'malware') {
    score += 20;
    indicators.push({ type: 'User-Reported Malware', severity: 'critical', description: 'Reporter identified this as a malware-carrying email' });
  }

  score = Math.min(score, 100);

  let verdict, verdictColor;
  if (score >= 70) { verdict = 'MALICIOUS'; verdictColor = 'red'; }
  else if (score >= 40) { verdict = 'SUSPICIOUS'; verdictColor = 'orange'; }
  else if (score >= 15) { verdict = 'LOW RISK'; verdictColor = 'yellow'; }
  else { verdict = 'LIKELY SAFE'; verdictColor = 'green'; }

  return { score, verdict, verdictColor, indicators };
};

const AdminReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/reports?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const r = data.report || (data.reports && data.reports[0]);
          if (r) {
            setReport(r);
            setNewStatus(r.status || 'pending');
            setAnalysis(analyzeReport(r));
          } else {
            setError('Report not found');
          }
        } else {
          setError('Failed to load report');
        }
      } catch (err) {
        setError('Network error loading report');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  const handleStatusUpdate = async (statusOverride) => {
    const statusToSet = statusOverride || newStatus;
    if (!statusToSet) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/reports`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, status: statusToSet, notes: adminNotes })
      });
      if (response.ok) {
        setReport(prev => ({ ...prev, status: statusToSet }));
        setNewStatus(statusToSet);
        toast.success('Report updated to: ' + statusToSet.replace('_', ' '));
        setAdminNotes('');
      } else {
        const data = await response.json();
        toast.error(data.msg || 'Failed to update report status');
      }
    } catch {
      toast.error('Network error updating report');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-16">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/app/admin/reports" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Reports
        </Link>
      </div>
    );
  }

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    investigating: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-red-100 text-red-800',
    resolved: 'bg-green-100 text-green-800',
    false_positive: 'bg-gray-100 text-gray-600',
  };

  const verdictBg = {
    red: 'from-red-600 to-red-700',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/app/admin/reports')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-white/60 mb-1 font-mono">{report.trackingNumber || `RPT-${String(report.id).padStart(4,'0')}`}</p>
              <h1 className="text-2xl font-bold">Admin Report Review</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${statusColors[report.status] || statusColors.pending}`}>
              {(report.status || 'pending').replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase border ${severityColors[report.severity] || severityColors.medium}`}>
              {report.severity || 'medium'}
            </span>
          </div>
        </div>
      </div>

      {/* Threat Analysis */}
      {analysis && (
        <div className={`bg-gradient-to-r ${verdictBg[analysis.verdictColor]} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <ShieldExclamationIcon className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-bold">AI Threat Analysis</h2>
                <p className="text-white/70 text-sm">Automated pattern detection results</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black">{analysis.score}<span className="text-2xl">/100</span></div>
              <div className="text-lg font-bold tracking-widest">{analysis.verdict}</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div className="h-3 rounded-full bg-white transition-all" style={{ width: `${analysis.score}%` }}></div>
          </div>
          {analysis.indicators.length > 0 ? (
            <div className="space-y-2">
              <p className="font-semibold text-sm uppercase tracking-wide text-white/80 mb-2">Threat Indicators Detected:</p>
              {analysis.indicators.map((ind, i) => (
                <div key={i} className="flex items-start space-x-3 bg-white/10 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">{ind.type}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full uppercase ${
                      ind.severity === 'critical' ? 'bg-red-900/50 text-red-100' :
                      ind.severity === 'high' ? 'bg-orange-900/50 text-orange-100' :
                      ind.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-100' :
                      'bg-green-900/50 text-green-100'
                    }`}>{ind.severity}</span>
                    <p className="text-sm text-white/80 mt-0.5">{ind.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/80 text-sm">No specific threat indicators detected. Manual review recommended.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Report Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Reporter Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Reporter Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Name</label>
                <p className="text-gray-900 font-medium">
                  {report.firstName || report.firstname || ''} {report.lastName || report.lastname || ''}
                  {!report.firstName && !report.firstname ? 'Anonymous' : ''}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
                <p className="text-gray-900 font-mono">{report.reporter_email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted</label>
                <p className="text-gray-900">{report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Report Type</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                  report.reportType === 'phishing' ? 'bg-red-100 text-red-700' :
                  report.reportType === 'malware' ? 'bg-purple-100 text-purple-700' :
                  report.reportType === 'spam' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{report.reportType || 'phishing'}</span>
              </div>
            </div>
          </div>

          {/* Suspicious Email Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-red-500" />
              Suspicious Email Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Subject Line</label>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-gray-900 font-medium">{report.subject || report.emailSubject || 'No subject'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sender Email</label>
                  <div className="bg-gray-50 border rounded-lg px-3 py-2 font-mono text-sm text-gray-900 break-all">
                    {report.senderEmail || 'Unknown'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sender Name</label>
                  <div className="bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-900">
                    {report.senderName || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
              Email Body Content
            </h3>
            {report.emailBody ? (
              <div className="bg-gray-50 border rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans leading-relaxed">
                  {report.emailBody}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="h-10 w-10 mx-auto mb-2" />
                <p>No email body provided</p>
              </div>
            )}
          </div>

          {/* Email Headers */}
          {report.emailHeaders && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Headers</h3>
              <div className="bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {report.emailHeaders}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right: Admin Actions */}
        <div className="space-y-6">

          {/* Update Status */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Update Status
            </h3>
            <div className="space-y-3">
              {['pending', 'investigating', 'confirmed', 'resolved', 'false_positive'].map(s => (
                <label key={s} className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition ${newStatus === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="status" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="text-blue-600" />
                  <span className="text-sm font-medium capitalize text-gray-900">{s.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add notes about this report..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {updating ? (
                <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>Updating...</>
              ) : (
                <><CheckCircleIcon className="h-4 w-4 mr-2" />Update Report</>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => handleStatusUpdate('confirmed')} className="w-full py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center justify-center">
                <XCircleIcon className="h-4 w-4 mr-2" /> Confirm Threat
              </button>
              <button onClick={() => handleStatusUpdate('false_positive')} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" /> Mark False Positive
              </button>
              <button onClick={() => handleStatusUpdate('resolved')} className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" /> Mark Resolved
              </button>
            </div>
          </div>

          {/* Report Meta */}
          <div className="bg-gray-50 rounded-xl border p-4 text-xs text-gray-500 space-y-1 font-mono">
            <p>ID: {report.id}</p>
            <p>Tracking: {report.trackingNumber}</p>
            <p>Created: {report.createdAt ? new Date(report.createdAt).toISOString() : 'N/A'}</p>
            <p>Updated: {report.updatedAt ? new Date(report.updatedAt).toISOString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportDetail;
