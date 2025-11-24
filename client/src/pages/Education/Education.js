import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Education = () => {
  const [filters, setFilters] = useState({
    category: '',
    difficulty: ''
  });

  const { data: modules, isLoading } = useQuery(
    ['educationModules', filters],
    () => axios.get(`${API_URL}/api/education/modules`, { params: filters }).then(res => res.data),
    {
      keepPreviousData: true
    }
  );

  const { data: progress } = useQuery(
    'educationProgress',
    () => axios.get(`${API_URL}/api/education/progress`).then(res => res.data)
  );

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

  const isModuleCompleted = (moduleId) => {
    return progress?.progress?.completedModules?.some(cm => cm.moduleId === moduleId);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading education modules..." />;
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'basics', label: 'Basics' },
    { value: 'identification', label: 'Identification' },
    { value: 'prevention', label: 'Prevention' },
    { value: 'response', label: 'Response' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Education Center</h1>
          <p className="text-gray-600">Learn how to identify and prevent phishing attacks</p>
        </div>
      </div>

      {/* Progress Overview */}
      {progress && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {progress.stats?.completedModules || 0}
              </div>
              <p className="text-sm text-gray-600">Modules Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {progress.stats?.completionRate || 0}%
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {progress.progress?.totalScore || 0}
              </div>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Modules */}
      {progress?.recommended && progress.recommended.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.recommended.map((module) => (
              <Link
                key={module._id}
                to={`/education/modules/${module._id}`}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{getCategoryIcon(module.category)}</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {module.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {module.estimatedTime} min
                  </div>
                  <div className="flex items-center text-blue-600">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Start
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="form-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="form-select"
            >
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* All Modules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Modules</h2>
        {modules && modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const completed = isModuleCompleted(module._id);
              return (
                <Link
                  key={module._id}
                  to={`/education/modules/${module._id}`}
                  className="card hover:shadow-md transition-shadow group relative"
                >
                  {completed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{getCategoryIcon(module.category)}</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {module.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {module.estimatedTime} min
                    </div>
                    <div className="flex items-center">
                      <span className="capitalize mr-2">{module.category}</span>
                      {completed ? (
                        <span className="text-green-600 font-medium">Completed</span>
                      ) : (
                        <div className="flex items-center text-blue-600">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Start
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {module.statistics && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{module.statistics.totalCompletions} completions</span>
                        {module.statistics.averageScore > 0 && (
                          <span>Avg: {Math.round(module.statistics.averageScore)}%</span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-500">
              No education modules match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Learning Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <AcademicCapIcon className="h-5 w-5 mr-2" />
          Learning Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h3 className="font-medium mb-2">📚 Start with Basics</h3>
            <p>Begin with fundamental concepts before moving to advanced topics.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">🎯 Practice Regularly</h3>
            <p>Regular practice helps reinforce learning and improve retention.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">🔄 Review Completed Modules</h3>
            <p>Revisit completed modules to refresh your knowledge.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">💡 Apply Knowledge</h3>
            <p>Use what you learn to identify real phishing attempts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
