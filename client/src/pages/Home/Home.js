import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  BellAlertIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const [stats, setStats] = useState({
    blocked: 2847,
    trained: 1234,
    reports: 456,
    score: 98
  });

  // Animate stats on load
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        blocked: prev.blocked + Math.floor(Math.random() * 3),
        trained: prev.trained,
        reports: prev.reports + (Math.random() > 0.7 ? 1 : 0),
        score: prev.score
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: ExclamationTriangleIcon, title: 'Report Phishing', desc: 'Quickly report suspicious emails and protect our community', color: 'from-red-500 to-orange-500' },
    { icon: AcademicCapIcon, title: 'Security Training', desc: '10 comprehensive modules with quizzes and certificates', color: 'from-blue-500 to-indigo-500' },
    { icon: ChartBarIcon, title: 'Threat Analytics', desc: 'Real-time statistics and threat intelligence dashboard', color: 'from-green-500 to-teal-500' },
    { icon: ShieldCheckIcon, title: 'AI Protection', desc: 'Advanced machine learning to detect sophisticated attacks', color: 'from-purple-500 to-pink-500' },
  ];

  const testimonials = [
    { name: 'Dr. Sarah Johnson', role: 'Professor, Computer Science', text: 'GUARDBULLDOG has transformed how our department handles security threats. The training modules are excellent.' },
    { name: 'Marcus Williams', role: 'IT Security Analyst', text: 'The reporting system is intuitive and the analytics help us respond to threats in real-time.' },
    { name: 'Angela Davis', role: 'Student, Senior Year', text: 'I learned so much about phishing through the education center. Now I can spot scams instantly!' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">GUARD<span className="text-blue-600">BULLDOG</span></span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.08\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-200 text-sm mb-6">
              <BellAlertIcon className="w-4 h-4 mr-2" />
              🛡️ Protecting Bowie State University Since 2024
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              GUARD<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">BULLDOG</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Advanced AI-Powered Phishing Detection & Security Awareness Platform for the Bowie State University Community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
                Get Started Free <ArrowRightIcon className="inline w-5 h-5 ml-2" />
              </Link>
              <Link to="/guest-report" className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition">
                🚨 Report Phishing Now
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {[
              { value: stats.blocked.toLocaleString(), label: 'Threats Blocked', icon: '🛡️' },
              { value: stats.trained.toLocaleString(), label: 'Users Trained', icon: '🎓' },
              { value: stats.reports.toLocaleString(), label: 'Reports Processed', icon: '📊' },
              { value: `${stats.score}%`, label: 'Security Score', icon: '✅' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center text-white mb-4 md:mb-0">
              <ExclamationTriangleIcon className="w-8 h-8 mr-3 animate-pulse" />
              <div>
                <h3 className="font-bold text-lg">Received a Suspicious Email?</h3>
                <p className="text-red-100">Report it instantly - no login required!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/guest-report" className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:shadow-lg transition">
                Report Anonymous
              </Link>
              <Link to="/track-report" className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-red-600 transition">
                Track Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Security Platform</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to stay protected from phishing attacks
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-6`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How GUARDBULLDOG Works</h2>
            <p className="text-xl text-gray-600">Simple steps to stay protected</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Report', desc: 'Submit suspicious emails through our easy reporting tool', icon: '📧' },
              { step: '2', title: 'Analyze', desc: 'Our AI system analyzes the threat in real-time', icon: '🔍' },
              { step: '3', title: 'Protect', desc: 'Community is alerted and protected from the threat', icon: '🛡️' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  {item.icon}
                </div>
                <div className="text-sm text-blue-600 font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Our Community</h2>
            <p className="text-xl text-gray-600">What Bowie State members say about us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{t.text}"</p>
                <div className="mt-4 text-yellow-400">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Protect Yourself?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Bowie State students and faculty in creating a safer digital campus.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">GUARDBULLDOG</span>
              </div>
              <p className="text-gray-400">Protecting the Bowie State University community from digital threats through education and awareness.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/guest-report" className="hover:text-white text-orange-400 font-semibold">🚨 Report Phishing</Link></li>
                <li><Link to="/track-report" className="hover:text-white">Track Report</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center"><MapPinIcon className="w-5 h-5 mr-2" />Bowie State University</li>
                <li className="flex items-center"><EnvelopeIcon className="w-5 h-5 mr-2" />security@bowiestate.edu</li>
                <li className="flex items-center"><PhoneIcon className="w-5 h-5 mr-2" />(301) 860-4000</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 GUARDBULLDOG - Bowie State University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
