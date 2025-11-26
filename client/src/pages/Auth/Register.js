import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, PhoneIcon, UserIcon, LockClosedIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain uppercase, lowercase and number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const { confirmPassword, ...data } = formData;
    const result = await register(data);
    if (result.success) navigate('/app/dashboard');
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    toast.error('Google Sign-In coming soon! Please register with email.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-blue-200 mt-2">Join the GUARDBULLDOG community</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Google Sign In */}
          <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">or register with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" className={`w-full pl-10 pr-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" className={`w-full px-4 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="you@bowie.edu" className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-gray-400">(optional)</span></label>
              <div className="relative">
                <PhoneIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (301) 860-0000" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-gray-400">(optional)</span></label>
              <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business">Business</option>
                <option value="Nursing">Nursing</option>
                <option value="Education">Education</option>
                <option value="Arts & Sciences">Arts & Sciences</option>
                <option value="Engineering">Engineering</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <div className="mt-2 flex gap-1">{['8+ chars', 'Uppercase', 'Number'].map((r, i) => <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{r}</span>)}</div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className={`w-full pl-10 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setAcceptTerms(!acceptTerms)} className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${acceptTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                {acceptTerms && <CheckIcon className="h-3 w-3 text-white" />}
              </button>
              <p className="text-sm text-gray-600">
                I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 hover:underline font-medium">Terms and Conditions</button> and <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 hover:underline font-medium">Privacy Policy</button>
              </p>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating Account...</span> : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link></p>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-6 text-blue-200 text-sm flex items-center justify-center gap-2">
          <ShieldCheckIcon className="h-5 w-5" />
          <span>Your data is secured with end-to-end encryption</span>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-700 space-y-4">
              <h3 className="font-bold text-lg">1. Acceptance of Terms</h3>
              <p>By creating an account on GUARDBULLDOG, you agree to these terms and conditions. This platform is designed to protect the Bowie State University community from phishing attacks and cybersecurity threats.</p>
              
              <h3 className="font-bold text-lg">2. User Responsibilities</h3>
              <p>Users agree to: (a) Provide accurate registration information; (b) Report suspicious emails in good faith; (c) Complete security awareness training; (d) Not share account credentials; (e) Follow university cybersecurity policies.</p>
              
              <h3 className="font-bold text-lg">3. Privacy Policy</h3>
              <p>We collect minimal personal information necessary for platform operation. Your email, name, and phone number are stored securely. Report data is used to improve threat detection and protect the community.</p>
              
              <h3 className="font-bold text-lg">4. Data Protection</h3>
              <p>All data is encrypted in transit and at rest. We do not sell or share personal information with third parties except as required by law or university policy.</p>
              
              <h3 className="font-bold text-lg">5. Acceptable Use</h3>
              <p>Users must not: (a) Submit false reports intentionally; (b) Attempt to access other users' accounts; (c) Use the platform for any illegal activities; (d) Distribute malware or phishing content.</p>
              
              <h3 className="font-bold text-lg">6. Limitation of Liability</h3>
              <p>GUARDBULLDOG is provided "as is" without warranties. We are not liable for any damages arising from use of the platform or failure to detect threats.</p>
              
              <h3 className="font-bold text-lg">7. Updates to Terms</h3>
              <p>We may update these terms periodically. Continued use of the platform constitutes acceptance of updated terms.</p>
              
              <h3 className="font-bold text-lg">8. Contact</h3>
              <p>For questions about these terms, contact: security@bowiestate.edu</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button onClick={() => setShowTerms(false)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">Close</button>
              <button onClick={() => { setAcceptTerms(true); setShowTerms(false); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Accept Terms</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
