import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ reports: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch user reports
        const reportsRes = await fetch(`${API_URL}/api/reports/user`, { headers });
        if (reportsRes.ok) {
          const data = await reportsRes.json();
          const reps = data.reports || data || [];
          setReports(reps);
          setStats({
            reports: reps.length,
            pending: reps.filter(r => r.status === 'pending').length,
            resolved: reps.filter(r => r.status === 'resolved').length
          });
        }
      } catch (err) {
        console.log('Dashboard fetch:', err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const quickStats = [
    { label: 'My Reports', value: stats.reports, icon: DocumentTextIcon, color: 'border-blue-500', iconColor: 'text-blue-500' },
    { label: 'Pending Review', value: stats.pending, icon: ClockIcon, color: 'border-yellow-500', iconColor: 'text-yellow-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircleIcon, color: 'border-green-500', iconColor: 'text-green-500' },
  ];

  const quickActions = [
    { to: '/app/report-phishing', icon: ExclamationTriangleIcon, title: 'Report Phishing', desc: 'Submit suspicious email', bg: 'bg-red-50 hover:bg-red-100', iconColor: 'text-red-600' },
    { to: '/app/education', icon: AcademicCapIcon, title: 'Education Center', desc: 'Learn about threats', bg: 'bg-blue-50 hover:bg-blue-100', iconColor: 'text-blue-600' },
    { to: '/app/my-reports', icon: DocumentTextIcon, title: 'My Reports', desc: 'Track your submissions', bg: 'bg-green-50 hover:bg-green-100', iconColor: 'text-green-600' },
    { to: '/app/profile', icon: ShieldCheckIcon, title: 'My Profile', desc: 'Manage your account', bg: 'bg-purple-50 hover:bg-purple-100', iconColor: 'text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'User'}! 👋</h1>
            <p className="mt-1 text-blue-100">Help protect Bowie State University from phishing threats</p>
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">🎓 {user?.role || 'Student'}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">📧 {user?.email}</span>
            </div>
          </div>
          <ShieldCheckIcon className="h-20 w-20 text-blue-200 hidden sm:block" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, i) => (
          <div key={i} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-10 w-10 ${stat.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
            My Recent Reports
          </h2>
          <Link to="/app/my-reports" className="text-sm text-blue-600 hover:underline">
            View All →
          </Link>
        </div>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No reports submitted yet</p>
            <p className="text-sm">Submit your first phishing report to help protect the community</p>
            <Link to="/app/report-phishing" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Report Phishing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report, i) => (
              <div key={report.id || i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-1 rounded">
                      {report.trackingNumber || `RPT-${String(report.id).padStart(4, '0')}`}
                    </span>
                    <span className="font-medium text-gray-900 truncate max-w-xs">
                      {report.subject || report.senderEmail || 'Phishing Report'}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    report.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                    report.status === 'confirmed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {report.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Reported: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.to} className={`flex items-center p-4 rounded-xl ${action.bg} transition-all hover:shadow-md`}>
              <action.icon className={`h-10 w-10 ${action.iconColor}`} />
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
          💡 Security Tip of the Day
        </h2>
        <p className="text-gray-700">
          <strong>Always verify the sender's email address</strong> before clicking any links. Phishers often use addresses that look similar to legitimate ones but with slight variations.
        </p>
        <Link to="/app/education" className="inline-block mt-4 text-blue-600 hover:underline font-medium">
          Learn more in our Education Center →
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
