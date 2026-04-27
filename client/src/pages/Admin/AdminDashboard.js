import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { headers: headers() }),
        fetch(`${API_URL}/api/admin/reports`, { headers: headers() })
      ]);

      if (!usersRes.ok || !reportsRes.ok) {
        const errUsers = usersRes.ok ? '' : `users(${usersRes.status})`;
        const errReports = reportsRes.ok ? '' : `reports(${reportsRes.status})`;
        throw new Error(`Failed to load admin data ${errUsers} ${errReports}`.trim());
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || usersData || []);
      }
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || reportsData.data || reportsData || []);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const pending = reports.filter((r) => (r.status || '').toLowerCase() === 'pending').length;
    const investigating = reports.filter((r) => (r.status || '').toLowerCase() === 'investigating').length;
    const resolved = reports.filter((r) => (r.status || '').toLowerCase() === 'resolved').length;

    return {
      users: users.length,
      reports: reports.length,
      pending,
      investigating,
      resolved
    };
  }, [users, reports]);

  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
      .slice(0, 8);
  }, [reports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900/5 rounded-2xl">
        <ArrowPathIcon className="h-10 w-10 text-slate-700 animate-spin" />
        <span className="ml-3 text-slate-700 font-medium">Loading admin workspace...</span>
      </div>
    );
  }

  const resolutionRate = stats.reports > 0 ? Math.round((stats.resolved / stats.reports) * 100) : 0;
  const pendingRate = stats.reports > 0 ? Math.round((stats.pending / stats.reports) * 100) : 0;
  const investigatingRate = stats.reports > 0 ? Math.round((stats.investigating / stats.reports) * 100) : 0;

  const statusClass = (status) => {
    const state = (status || '').toLowerCase();
    if (state === 'resolved') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (state === 'investigating') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (state === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 md:p-8 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheckIcon className="h-4 w-4" /> Security Operations Center
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Admin Command Dashboard</h1>
            <p className="mt-2 text-slate-200 max-w-2xl">
              Centralized oversight for user activity, incident reports, and response execution.
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Last synced: {lastUpdated ? lastUpdated.toLocaleString() : 'Not available'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/app/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold hover:shadow-lg transition"
            >
              Open Report Queue
            </Link>
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2.5 bg-white/15 border border-white/20 rounded-xl hover:bg-white/25 transition font-semibold"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
          <UsersIcon className="h-7 w-7 text-indigo-600" />
          <p className="text-3xl font-extrabold mt-3 text-slate-900">{stats.users}</p>
          <p className="text-slate-500 text-sm mt-1">Registered users</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
          <DocumentTextIcon className="h-7 w-7 text-orange-600" />
          <p className="text-3xl font-extrabold mt-3 text-slate-900">{stats.reports}</p>
          <p className="text-slate-500 text-sm mt-1">Total reports</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
          <ClockIcon className="h-7 w-7 text-amber-600" />
          <p className="text-3xl font-extrabold mt-3 text-slate-900">{stats.pending}</p>
          <p className="text-slate-500 text-sm mt-1">Pending review</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
          <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
          <p className="text-3xl font-extrabold mt-3 text-slate-900">{stats.resolved}</p>
          <p className="text-slate-500 text-sm mt-1">Resolved incidents</p>
        </div>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Response Overview</h3>
            <ChartBarIcon className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{resolutionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Resolution rate</p>
          <div className="space-y-3 mt-5">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Pending</span><span>{pendingRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Investigating</span><span>{investigatingRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${investigatingRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Resolved</span><span>{resolutionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${resolutionRate}%` }} />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{stats.resolved} of {stats.reports} reports resolved</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Recent Reports</h3>
            <Link to="/app/admin/reports" className="text-sm font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center">
              View all <EyeIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No reports submitted yet</p>
              <p className="text-xs mt-1">As users submit reports, they will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReports.map((r, i) => (
                <div key={r.id || i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {r.subject || 'Suspicious Email Report'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {(r.senderEmail || r.sender_email || 'Unknown sender')} • {new Date(r.createdAt || r.created_at || Date.now()).toLocaleString()}
                    </p>
                  </div>
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusClass(r.status)}`}>
                    {r.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p>Report visibility is now connected directly to live admin APIs.</p>
        <p className="text-slate-300">If a report is submitted successfully, it will appear in this dashboard after refresh.</p>
      </div>

    </div>
  );
};

export default AdminDashboard;
