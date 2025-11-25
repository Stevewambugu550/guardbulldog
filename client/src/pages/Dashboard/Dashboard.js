import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName || 'User'}! 🛡️
            </h1>
            <p className="mt-1 text-blue-100">
              Help protect Bowie State University from phishing threats
            </p>
            <p className="mt-1 text-blue-200 text-sm">
              Role: {user?.role || 'Student'} | Department: {user?.department || 'Not specified'}
            </p>
          </div>
          <div className="hidden sm:block">
            <ShieldCheckIcon className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">My Reports</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Modules</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/app/report" className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Report Phishing</h3>
              <p className="text-sm text-gray-500">Submit a suspicious email</p>
            </div>
          </Link>
          <Link to="/app/education" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <AcademicCapIcon className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Education Center</h3>
              <p className="text-sm text-gray-500">Learn about cyber security</p>
            </div>
          </Link>
          <Link to="/app/intelligence" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <MagnifyingGlassIcon className="h-10 w-10 text-purple-600" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Threat Intelligence</h3>
              <p className="text-sm text-gray-500">Check IP/Email threats</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Overview - Based on Requirements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">Guest access for anonymous reporting</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">Date storage for all submitted emails</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">Database stores email source & headers</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">Target roles: Student & Faculty</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">IP address tracking & threat detection</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">Safe/Phishing email analysis</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">User inquiry system to admin</span>
          </div>
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-sm">Reports linked to user profiles</span>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          Security Tip of the Day
        </h2>
        <p className="text-blue-800">
          Always verify the sender's email address before clicking any links. Legitimate organizations 
          will never ask for sensitive information via email. When in doubt, contact the organization 
          directly through their official website or phone number.
        </p>
      </div>

      {/* Admin Quick Access */}
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
            🔐 Administration Panel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/app/admin/dashboard" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <ChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
              <p className="text-sm text-gray-500">View system statistics</p>
            </Link>
            <Link to="/app/admin/reports" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <DocumentTextIcon className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Reports</h3>
              <p className="text-sm text-gray-500">Review all phishing reports</p>
            </Link>
            <Link to="/app/admin/users" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View all users</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
