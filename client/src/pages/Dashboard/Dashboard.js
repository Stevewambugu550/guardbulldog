import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [threats, setThreats] = useState([]);
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

        // Fetch messages
        const msgsRes = await fetch(`${API_URL}/api/messages`, { headers });
        if (msgsRes.ok) {
          const data = await msgsRes.json();
          setMessages(data.messages || []);
        }

        // Fetch live threats
        const threatsRes = await fetch(`${API_URL}/api/intelligence/threats`, { headers });
        if (threatsRes.ok) {
          const data = await threatsRes.json();
          setThreats(data.threats || data || []);
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
    { label: 'Modules Completed', value: '3/10', icon: AcademicCapIcon, color: 'border-purple-500', iconColor: 'text-purple-500' },
  ];

  const quickActions = [
    { to: '/app/report', icon: ExclamationTriangleIcon, title: 'Report Phishing', desc: 'Submit suspicious email', bg: 'bg-red-50 hover:bg-red-100', iconColor: 'text-red-600' },
    { to: '/app/education', icon: AcademicCapIcon, title: 'Education Center', desc: '10 modules with quizzes', bg: 'bg-blue-50 hover:bg-blue-100', iconColor: 'text-blue-600' },
    { to: '/app/intelligence', icon: MagnifyingGlassIcon, title: 'Threat Intelligence', desc: 'View threat analytics', bg: 'bg-purple-50 hover:bg-purple-100', iconColor: 'text-purple-600' },
    { to: '/app/my-reports', icon: DocumentTextIcon, title: 'My Reports', desc: 'Track your submissions', bg: 'bg-green-50 hover:bg-green-100', iconColor: 'text-green-600' },
  ];

  // Use real threats or show placeholder if none
  const recentThreats = threats.length > 0 ? threats.slice(0, 3).map(t => ({
    type: t.type || t.threat_type || 'Unknown Threat',
    target: t.target || 'General',
    severity: t.severity || 'Medium',
    time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'
  })) : [
    { type: 'No active threats', target: 'System is secure', severity: 'Low', time: 'Now' }
  ];

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages from Admin */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2 text-blue-600" />
              Messages
              {messages.filter(m => !m.is_read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {messages.filter(m => !m.is_read).length} new
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-sm">Admin messages will appear here</p>
              </div>
            ) : (
              messages.slice(0, 5).map(msg => (
                <div key={msg.id} className={`p-4 rounded-lg ${msg.is_read ? 'bg-gray-50' : 'bg-blue-50 ring-2 ring-blue-200'}`}>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {msg.sender_first_name?.[0] || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">{msg.subject || 'Message'}</h3>
                        {!msg.is_read && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{msg.content?.substring(0, 100)}</p>
                      <p className="text-xs text-gray-400 mt-2">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Threats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
            Recent Threats
          </h2>
          <div className="space-y-4">
            {recentThreats.map((threat, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm">{threat.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    threat.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{threat.severity}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Target: {threat.target}</p>
                <p className="text-xs text-gray-400 mt-1">{threat.time}</p>
              </div>
            ))}
          </div>
          <Link to="/app/intelligence" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
            View All Threats →
          </Link>
        </div>
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
          <strong>Always verify the sender's email address</strong> before clicking any links. Phishers often use addresses that look similar to legitimate ones but with slight variations (e.g., support@amaz0n.com instead of support@amazon.com).
        </p>
        <Link to="/app/education" className="inline-block mt-4 text-blue-600 hover:underline font-medium">
          Learn more in our Education Center →
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
