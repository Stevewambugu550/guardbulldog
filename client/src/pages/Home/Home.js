import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BellAlertIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const [stats, setStats] = useState({
    blocked: 2847,
    trained: 1234,
    reports: 456,
    score: 98
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { icon: ExclamationTriangleIcon, title: 'Rapid Incident Reporting', desc: 'Submit suspicious emails in under a minute with guided reporting fields.', color: 'from-rose-500 to-red-600' },
    { icon: AcademicCapIcon, title: 'Awareness Training Center', desc: 'Scenario-based modules, quizzes, and progress tracking for campus users.', color: 'from-blue-600 to-indigo-600' },
    { icon: ChartBarIcon, title: 'Operational Threat Insights', desc: 'Live dashboards help administrators prioritize and respond faster.', color: 'from-emerald-500 to-teal-600' },
    { icon: ShieldCheckIcon, title: 'AI-Assisted Detection', desc: 'Automated triage highlights likely phishing patterns before impact spreads.', color: 'from-violet-600 to-fuchsia-600' },
  ];

  const testimonials = [
    { name: 'Dr. Sarah Johnson', role: 'Professor, Computer Science', text: 'GUARDBULLDOG gave our department a consistent playbook for identifying and escalating suspicious messages.' },
    { name: 'Marcus Williams', role: 'IT Security Analyst', text: 'The response pipeline is clear, and reporting quality improved significantly after rollout.' },
    { name: 'Angela Davis', role: 'Senior Student Leader', text: 'The training is practical, clear, and immediately useful in day-to-day campus communication.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">GUARD<span className="text-blue-700">BULLDOG</span></span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-700 hover:text-blue-700 font-semibold">Home</Link>
              <Link to="/about" className="text-slate-700 hover:text-blue-700 font-semibold">About</Link>
              <Link to="/contact" className="text-slate-700 hover:text-blue-700 font-semibold">Contact</Link>
              <Link to="/email-analyzer" className="text-blue-700 hover:text-blue-800 font-semibold">Email Analyzer</Link>
              <Link to="/guest-report" className="text-red-600 hover:text-red-700 font-semibold">Report</Link>
              <Link to="/login" className="text-slate-700 hover:text-blue-700 font-semibold">Sign In</Link>
              <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-lg hover:shadow-lg transition font-semibold">
                Create Account
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Home</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">About</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Contact</Link>
              <Link to="/email-analyzer" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold">Email Analyzer</Link>
              <Link to="/guest-report" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold">Report Phishing</Link>
              <Link to="/track-report" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Track Report</Link>
              <hr className="my-2" />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-lg font-semibold text-center">Create Account</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-100 text-sm mb-6 border border-blue-300/20">
              <BellAlertIcon className="w-4 h-4 mr-2" />
              Trusted cyber awareness program for Bowie State University
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              GUARD<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">BULLDOG</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Professional phishing prevention and response platform built to help students, faculty, and administrators identify, report, and mitigate threats quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/email-analyzer" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
                Analyze an Email <ArrowRightIcon className="inline w-5 h-5 ml-2" />
              </Link>
              <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-semibold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
                Launch Security Workspace <ArrowRightIcon className="inline w-5 h-5 ml-2" />
              </Link>
              <Link to="/guest-report" className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition">
                Report Suspicious Email
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-blue-100/90">
              <span className="px-3 py-1 rounded-full border border-blue-300/30 bg-blue-500/10">24/7 Availability</span>
              <span className="px-3 py-1 rounded-full border border-blue-300/30 bg-blue-500/10">Campus-Focused Workflows</span>
              <span className="px-3 py-1 rounded-full border border-blue-300/30 bg-blue-500/10">Incident Tracking Included</span>
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
              <div key={i} className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-6 text-center shadow-lg">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                <div className="text-blue-100 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <section className="bg-gradient-to-r from-rose-700 to-orange-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center text-white mb-4 md:mb-0">
              <ExclamationTriangleIcon className="w-8 h-8 mr-3 animate-pulse" />
              <div>
                <h3 className="font-bold text-lg">Need to report suspicious activity right now?</h3>
                <p className="text-red-100">Use anonymous reporting in seconds. No account required.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/guest-report" className="px-6 py-3 bg-white text-red-700 rounded-lg font-semibold hover:shadow-lg transition">
                Submit Report
              </Link>
              <Link to="/track-report" className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-700 transition">
                Track Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Security Platform Built for Campus Operations</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Structured prevention, training, and response tools in one professional workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition transform hover:-translate-y-2 border border-slate-100">
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-6`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How the Protection Workflow Operates</h2>
            <p className="text-xl text-slate-600">A clear, accountable process from report to resolution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Report', desc: 'Users submit suspicious messages with key context and evidence.', icon: '📧' },
              { step: '2', title: 'Assess', desc: 'Automated and human review identifies urgency and likely threat type.', icon: '🔍' },
              { step: '3', title: 'Respond', desc: 'Security teams publish guidance and track remediation progress.', icon: '🛡️' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">
                  {item.icon}
                </div>
                <div className="text-sm text-blue-700 font-bold mb-2 tracking-wide">STEP {item.step}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-100 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Trusted Across the Bowie State Community</h2>
            <p className="text-xl text-slate-600">Feedback from faculty, students, and security operations staff.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-slate-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{t.text}"</p>
                <div className="mt-4 text-yellow-400">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Build a Safer Digital Campus Today</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Start with reporting, training, and tracking tools designed for higher-education security teams.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
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
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
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
