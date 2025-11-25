import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent successfully! We will respond within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    { icon: EnvelopeIcon, title: 'Email', value: 'security@bowiestate.edu', link: 'mailto:security@bowiestate.edu', desc: 'For general inquiries' },
    { icon: PhoneIcon, title: 'Phone', value: '(301) 860-4000', link: 'tel:3018604000', desc: 'Mon-Fri 8am-5pm EST' },
    { icon: MapPinIcon, title: 'Address', value: 'Bowie State University', link: '#', desc: '14000 Jericho Park Rd, Bowie, MD' },
    { icon: ClockIcon, title: 'Hours', value: '24/7 Support', link: '#', desc: 'Emergency response available' },
  ];

  const faqs = [
    { q: 'How do I report a phishing email?', a: 'Use our Report Phishing feature in the dashboard or the guest reporting tool on the homepage.' },
    { q: 'What happens after I submit a report?', a: 'Our security team reviews the report within 24 hours and takes appropriate action.' },
    { q: 'How can I protect myself from phishing?', a: 'Complete our Education Center modules to learn how to identify and prevent attacks.' },
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
              <Link to="/contact" className="text-blue-600 font-medium">Contact</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Us</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Have questions or need help? Our security team is here to assist you 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, i) => (
              <a key={i} href={item.link} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-blue-600 font-medium mt-1">{item.value}</p>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3 text-blue-600" />
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@bowiestate.edu" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="phishing">Phishing Report Help</option>
                    <option value="technical">Technical Support</option>
                    <option value="training">Training Questions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows={5} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="How can we help you?" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition flex items-center justify-center">
                  {loading ? 'Sending...' : <><PaperAirplaneIcon className="w-5 h-5 mr-2" /> Send Message</>}
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">❓ {faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-bold text-red-800 mb-2">🚨 Security Emergency?</h3>
                <p className="text-red-700 mb-4">If you believe you've been compromised or are facing an active threat:</p>
                <a href="tel:3018604000" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">
                  <PhoneIcon className="w-5 h-5 mr-2" /> Call Now: (301) 860-4000
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">GUARDBULLDOG</span>
          </div>
          <p className="text-gray-400 mb-6">Protecting Bowie State University from digital threats.</p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/login" className="hover:text-white">Sign In</Link>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
            <p>© 2024 GUARDBULLDOG - Bowie State University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
