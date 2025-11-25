import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, PhoneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

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
