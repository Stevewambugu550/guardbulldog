import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '123456789-example.apps.googleusercontent.com',
          callback: handleGoogleResponse
        });
      }
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Signed in with Google!');
        window.location.href = '/app/dashboard';
      } else {
        toast.error(data.message || 'Google sign-in failed');
      }
    } catch (err) {
      toast.error('Google sign-in error');
    }
  };

  const handleGoogleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In is loading. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) {
      newErrors.identifier = loginMethod === 'email' ? 'Email is required' : 'Phone number is required';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = await login(formData.identifier, formData.password);
    if (result.success) {
      navigate('/app/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen hero-pattern flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-gray-900 font-bold text-3xl" style={{fontFamily: 'Orbitron'}}>GB</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900" style={{fontFamily: 'Orbitron'}}>
            <span className="gradient-text">GUARD</span>BULLDOG
          </h1>
          <p className="mt-3 text-lg text-gray-600" style={{fontFamily: 'Rajdhani'}}>
            Phishing Awareness & Reporting System
          </p>
        </div>

        {/* Form Card */}
        <div className="card card-hover">
          {/* Google Sign In */}
          <button 
            type="button"
            onClick={handleGoogleClick} 
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">or sign in with email/phone</span></div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setFormData({...formData, identifier: ''}); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition ${
                  loginMethod === 'email' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setFormData({...formData, identifier: ''}); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition ${
                  loginMethod === 'phone' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Phone
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Rajdhani'}}>
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' ? (
                    <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : (
                    <PhoneIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  )}
                  <input
                    id="identifier"
                    name="identifier"
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                    required
                    className={`w-full pl-10 pr-4 py-3 border ${errors.identifier ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
                    placeholder={loginMethod === 'email' ? 'student@bowie.edu' : '+1 (301) 860-0000'}
                    value={formData.identifier}
                    onChange={handleChange}
                  />
                </div>
                {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Rajdhani'}}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{fontFamily: 'Rajdhani'}}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600" style={{fontFamily: 'Rajdhani'}}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold gradient-text hover:opacity-80 transition-opacity"
            >
              Create one here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
