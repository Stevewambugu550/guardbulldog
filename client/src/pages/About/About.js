import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  AcademicCapIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const team = [
    { name: 'IT Security Team', role: 'System Administration', icon: '🛡️' },
    { name: 'Development Team', role: 'Software Engineering', icon: '💻' },
    { name: 'Education Team', role: 'Training & Content', icon: '📚' },
    { name: 'Support Team', role: 'User Assistance', icon: '🤝' },
  ];

  const values = [
    { icon: ShieldCheckIcon, title: 'Security First', desc: 'We prioritize the protection of our university community above all else.' },
    { icon: AcademicCapIcon, title: 'Education', desc: 'We believe knowledge is the best defense against cyber threats.' },
    { icon: UserGroupIcon, title: 'Community', desc: 'Together we create a safer digital environment for everyone.' },
    { icon: GlobeAltIcon, title: 'Innovation', desc: 'We continuously evolve to stay ahead of emerging threats.' },
  ];

  const stats = [
    { value: '2,847+', label: 'Threats Blocked' },
    { value: '1,234+', label: 'Users Trained' },
    { value: '98%', label: 'Security Score' },
    { value: '24/7', label: 'Monitoring' },
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
              <Link to="/about" className="text-blue-600 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</Link>
              <Link to="/guest-report" className="text-red-600 hover:text-red-700 font-medium">🚨 Report</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                Get Started
              </Link>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">🏠 Home</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium">ℹ️ About</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">📞 Contact</Link>
              <Link to="/guest-report" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold">🚨 Report Phishing</Link>
              <hr className="my-2" />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">🔐 Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-center">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">GUARDBULLDOG</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Protecting the Bowie State University community from phishing attacks through advanced technology, education, and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                GUARDBULLDOG is a comprehensive phishing awareness and security reporting platform designed specifically for the students, faculty, and staff of <strong>Bowie State University</strong>.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to create a safer digital campus by empowering our community to recognize, report, and defend against malicious cyber threats like phishing, social engineering, and email fraud.
              </p>
              <div className="space-y-4">
                {['AI-powered threat detection', 'Comprehensive security training', 'Real-time reporting system', 'Community-driven protection'].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white">
              <div className="text-center">
                <ShieldCheckIcon className="w-20 h-20 mx-auto mb-6 opacity-90" />
                <h3 className="text-2xl font-bold mb-4">Security at Scale</h3>
                <p className="text-blue-100 mb-8">
                  Protecting thousands of users across the Bowie State University network.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-blue-200 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Threat */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full text-red-700 text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Understanding the Danger
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Phishing Threat</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Phishing attacks are the #1 cause of data breaches worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { stat: '90%', title: 'Of Data Breaches', desc: 'Start with a phishing attack' },
              { stat: '$4.7M', title: 'Average Cost', desc: 'Per data breach incident' },
              { stat: '3.4B', title: 'Daily Attacks', desc: 'Phishing emails sent globally' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-5xl font-bold text-red-600 mb-4">{item.stat}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Approach</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with continuous education
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🤖', title: 'AI-Powered Detection', desc: 'Advanced machine learning analyzes emails for threats in real-time' },
              { icon: '📧', title: 'Instant Reporting', desc: 'One-click tool to report suspicious emails directly to security' },
              { icon: '📚', title: 'Education Center', desc: '10 comprehensive modules with quizzes to build your skills' },
              { icon: '🛡️', title: 'Community Defense', desc: 'Every report helps protect the entire university' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <v.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">Dedicated professionals keeping you safe</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Security Community</h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of the solution. Help us protect Bowie State University.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-xl transition">
              Create Account
            </Link>
            <Link to="/guest-report" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition">
              Report Phishing
            </Link>
          </div>
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
              <p className="text-gray-400">Protecting the Bowie State University community from digital threats.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Account</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><Link to="/guest-report" className="hover:text-white text-orange-400">Report Phishing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
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

export default About;
