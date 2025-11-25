import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Education = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/education/modules`);
        setModules(res.data || []);
      } catch (err) {
        console.log('Education fetch error:', err.message);
        // Use default modules if API fails
        setModules(defaultModules);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const defaultModules = [
    {
      id: 1,
      title: 'Introduction to Phishing',
      description: 'Learn the basics of phishing attacks and how to identify them',
      category: 'basics',
      difficulty: 'beginner',
      duration: 15,
      content: `
## What is Phishing?
Phishing is a cyber attack where attackers impersonate legitimate organizations to steal sensitive information.

## Common Types:
- **Email Phishing** - Fraudulent emails from fake sources
- **Spear Phishing** - Targeted attacks on specific people
- **Smishing** - Phishing via SMS text messages
- **Vishing** - Voice phishing through phone calls

## Warning Signs:
- Urgent or threatening language
- Requests for personal information
- Suspicious sender addresses
- Poor grammar and spelling
      `
    },
    {
      id: 2,
      title: 'Identifying Phishing Emails',
      description: 'Master the skills to spot suspicious emails',
      category: 'identification',
      difficulty: 'beginner',
      duration: 20,
      content: `
## Red Flags to Watch For:

### 1. Sender Analysis
- Check the email address carefully
- Look for misspellings (paypa1.com vs paypal.com)

### 2. Content Inspection
- Urgent calls to action
- Too-good-to-be-true offers

### 3. Link Analysis
- Hover over links before clicking
- Check the actual URL destination
      `
    },
    {
      id: 3,
      title: 'Safe Browsing Practices',
      description: 'Learn how to browse the internet safely',
      category: 'prevention',
      difficulty: 'beginner',
      duration: 15,
      content: `
## Safe Browsing Tips:

- Always check for HTTPS
- Don't click on suspicious ads
- Use strong, unique passwords
- Enable two-factor authentication
- Keep your browser updated
      `
    },
    {
      id: 4,
      title: 'Password Security',
      description: 'Create and manage secure passwords',
      category: 'prevention',
      difficulty: 'intermediate',
      duration: 20,
      content: `
## Password Best Practices:

- Use at least 12 characters
- Mix uppercase, lowercase, numbers, symbols
- Don't reuse passwords
- Use a password manager
- Enable 2FA when available
      `
    },
    {
      id: 5,
      title: 'Social Engineering Attacks',
      description: 'Understand manipulation techniques used by attackers',
      category: 'advanced',
      difficulty: 'intermediate',
      duration: 25,
      content: `
## Social Engineering Techniques:

- **Pretexting** - Creating fake scenarios
- **Baiting** - Offering something enticing
- **Tailgating** - Following authorized personnel
- **Quid Pro Quo** - Offering services for info
      `
    },
    {
      id: 6,
      title: 'Incident Response',
      description: 'What to do if you fall victim to phishing',
      category: 'response',
      difficulty: 'intermediate',
      duration: 15,
      content: `
## If You've Been Phished:

1. Change your passwords immediately
2. Contact your IT department
3. Monitor your accounts
4. Report the incident
5. Enable fraud alerts
      `
    }
  ];

  const displayModules = modules.length > 0 ? modules : defaultModules;

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      basics: '📚',
      identification: '🔍',
      prevention: '🛡️',
      response: '⚡',
      advanced: '🎓'
    };
    return icons[category] || '📖';
  };

  const filteredModules = filter === 'all' 
    ? displayModules 
    : displayModules.filter(m => m.category === filter || m.difficulty === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading education modules...</span>
      </div>
    );
  }

  if (selectedModule) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedModule(null)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to all modules
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{getCategoryIcon(selectedModule.category)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedModule.difficulty)}`}>
                  {selectedModule.difficulty}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {selectedModule.duration} min
                </span>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none mt-6">
            <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-line">
              {selectedModule.content}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setSelectedModule(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Modules
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <AcademicCapIcon className="h-10 w-10 mr-4" />
          <div>
            <h1 className="text-2xl font-bold">Education Center</h1>
            <p className="text-purple-100">Learn to identify and prevent phishing attacks</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Modules
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'beginner' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'intermediate' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setFilter('prevention')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'prevention' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Prevention
          </button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            onClick={() => setSelectedModule(module)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{getCategoryIcon(module.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{module.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {module.duration} min
                </span>
                <span className="text-blue-600 flex items-center font-medium">
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Start
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <BookOpenIcon className="h-5 w-5 mr-2" />
          Learning Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">📚</span>
            <div>
              <strong>Start with Basics</strong>
              <p>Begin with fundamental concepts first</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">🎯</span>
            <div>
              <strong>Practice Regularly</strong>
              <p>Regular practice improves retention</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">🔄</span>
            <div>
              <strong>Review Often</strong>
              <p>Revisit completed modules periodically</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">💡</span>
            <div>
              <strong>Apply Knowledge</strong>
              <p>Use what you learn in real situations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
