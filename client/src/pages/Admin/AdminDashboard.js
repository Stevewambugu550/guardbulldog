import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { headers: headers() }),
        fetch(`${API_URL}/api/admin/reports`, { headers: headers() })
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const stats = {
    users: users.length,
    reports: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-12 w-12 text-purple-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const resolutionRate = stats.reports > 0 ? Math.round((stats.resolved / stats.reports) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <ShieldCheckIcon className="h-8 w-8 mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-purple-100 mt-1">Platform overview and activity summary</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
          <UsersIcon className="h-8 w-8 text-blue-500" />
          <p className="text-3xl font-bold mt-3 text-gray-900">{stats.users}</p>
          <p className="text-gray-500 text-sm mt-1">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition">
          <DocumentTextIcon className="h-8 w-8 text-orange-500" />
          <p className="text-3xl font-bold mt-3 text-gray-900">{stats.reports}</p>
          <p className="text-gray-500 text-sm mt-1">Total Reports</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          <p className="text-3xl font-bold mt-3 text-gray-900">{stats.pending}</p>
          <p className="text-gray-500 text-sm mt-1">Pending Review</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition">
          <CheckCircleIcon className="h-8 w-8 text-green-500" />
          <p className="text-3xl font-bold mt-3 text-gray-900">{stats.resolved}</p>
          <p className="text-gray-500 text-sm mt-1">Resolved</p>
        </div>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Resolution Rate</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{resolutionRate}%</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${resolutionRate}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.resolved} of {stats.reports} reports resolved</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Recent Reports</h3>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReports.map((r, i) => (
                <div key={r.id || i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.subject || 'Suspicious Email Report'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {r.senderEmail || r.sender_email || 'Unknown sender'}
                    </p>
                  </div>
                  <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    r.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    r.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {r.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
