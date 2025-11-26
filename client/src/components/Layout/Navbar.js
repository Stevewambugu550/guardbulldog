import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumbs from './Breadcrumbs';
import { 
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellAnimation, setBellAnimation] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch real messages as notifications
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${API_URL}/api/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const msgs = data.messages || [];
          
          // Convert messages to notifications
          const notifs = msgs.slice(0, 5).map(m => ({
            id: m.id,
            icon: '💬',
            type: 'message',
            title: m.subject || 'New Message',
            message: m.content?.substring(0, 50) + (m.content?.length > 50 ? '...' : ''),
            time: formatTime(new Date(m.created_at)),
            unread: !m.is_read
          }));
          
          setNotifications(notifs);
        }
      } catch (err) {
        console.log('Fetch messages:', err.message);
      }
    };

    const formatTime = (date) => {
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
      return date.toLocaleDateString();
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [API_URL]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand - Fixed width */}
          <div className="flex items-center flex-shrink-0" style={{ minWidth: '200px' }}>
            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary mr-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="hidden lg:block">
                <span className="text-xl font-bold text-gray-800">GUARD<span className="text-blue-600">BULLDOG</span></span>
                <div className="text-xs text-gray-500 -mt-1">Phishing Protection</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center px-4">
            <Breadcrumbs />
          </div>

          {/* Right side - Fixed width */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Quick Actions - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                to="/app/report-phishing"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md transition-all"
              >
                🚨 Report Phishing
              </Link>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full relative transition-all ${bellAnimation ? 'animate-bounce' : ''}`}
              >
                <BellIcon className={`h-6 w-6 ${bellAnimation ? 'text-blue-600' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-96 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center">
                        <BellIcon className="h-5 w-5 mr-2" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </h3>
                      <button 
                        onClick={markAllRead}
                        className="text-xs text-blue-100 hover:text-white transition"
                      >
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start">
                            <span className="text-2xl mr-3">{notification.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900 truncate">{notification.title}</p>
                                {notification.unread && (
                                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                    <Link 
                      to="/app/dashboard" 
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary p-1 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-gray-700 font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize mt-1">{user?.role?.replace('_', ' ')} • {user?.department}</p>
                    </div>
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <HomeIcon className="h-4 w-4 mr-3 text-blue-500" />
                      🏠 Back to Home
                    </Link>
                    <Link
                      to="/app/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Profile Settings
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
