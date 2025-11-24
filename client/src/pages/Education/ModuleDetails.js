import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  ArrowLeftIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ModuleDetails = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizStartTime] = useState(Date.now());

  const { data: module, isLoading } = useQuery(
    ['educationModule', moduleId],
    () => axios.get(`${API_URL}/api/education/modules/${moduleId}`).then(res => res.data),
    {
      enabled: !!moduleId
    }
  );

  const submitQuizMutation = useMutation(
    (quizData) => axios.post(`${API_URL}/api/education/modules/${moduleId}/quiz`, quizData),
    {
      onSuccess: (response) => {
        const { passed, score } = response.data;
        if (passed) {
          toast.success(`Congratulations! You scored ${score}% and completed the module!`);
          queryClient.invalidateQueries('educationProgress');
          navigate('/app/education');
        } else {
          toast.error(`You scored ${score}%. You need ${module.quiz.passingScore}% to pass. Please try again.`);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit quiz');
      }
    }
  );

  const handleQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    const answers = module.quiz.questions.map((_, index) => quizAnswers[index] || '');
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000 / 60); // minutes

    submitQuizMutation.mutate({
      answers,
      timeSpent
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading module..." />;
  }

  if (!module) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Module not found</h3>
        <button onClick={() => navigate('/app/education')} className="btn-primary">
          Back to Education
        </button>
      </div>
    );
  }

  const sections = module.content?.sections || [];
  const currentSectionData = sections[currentSection];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/app/education')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                {module.difficulty}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                {module.estimatedTime} minutes
              </div>
              <span className="text-sm text-gray-500 capitalize">{module.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Description */}
      <div className="card">
        <p className="text-gray-700">{module.description}</p>
      </div>

      {/* Content Sections */}
      {!showQuiz && sections.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentSectionData?.title || `Section ${currentSection + 1}`}
            </h2>
            <div className="text-sm text-gray-500">
              {currentSection + 1} of {sections.length}
            </div>
          </div>

          <div className="space-y-6">
            {/* Section Content */}
            <div className="prose max-w-none">
              {currentSectionData?.type === 'video' && currentSectionData.mediaUrl ? (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Video content would be embedded here</p>
                    <p className="text-sm text-gray-500">{currentSectionData.mediaUrl}</p>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-gray-700">
                  {currentSectionData?.content}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="btn-primary"
                >
                  Next Section
                </button>
              ) : (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="btn-primary flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Take Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Section */}
      {showQuiz && module.quiz && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quiz</h2>
            <p className="text-sm text-gray-600 mt-1">
              You need {module.quiz.passingScore}% to pass this module
            </p>
          </div>

          <div className="space-y-6">
            {module.quiz.questions.map((question, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="font-medium text-gray-900 mb-3">
                  {index + 1}. {question.question}
                </h3>

                <div className="space-y-2">
                  {question.type === 'multiple_choice' && question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={quizAnswers[index] === option}
                        onChange={() => handleQuizAnswer(index, option)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}

                  {question.type === 'true_false' && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="true"
                          checked={quizAnswers[index] === 'true'}
                          onChange={() => handleQuizAnswer(index, 'true')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-gray-700">True</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="false"
                          checked={quizAnswers[index] === 'false'}
                          onChange={() => handleQuizAnswer(index, 'false')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-gray-700">False</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowQuiz(false)}
                className="btn-secondary"
              >
                Back to Content
              </button>

              <button
                onClick={handleSubmitQuiz}
                disabled={submitQuizMutation.isLoading || Object.keys(quizAnswers).length < module.quiz.questions.length}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitQuizMutation.isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Examples Section */}
      {module.examples && module.examples.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Examples</h2>
          </div>
          <div className="space-y-6">
            {module.examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{example.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    example.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    example.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    example.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {example.riskLevel} risk
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{example.description}</p>
                
                {example.emailExample && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm space-y-2">
                      <div><strong>From:</strong> {example.emailExample.sender}</div>
                      <div><strong>Subject:</strong> {example.emailExample.subject}</div>
                      <div className="border-t pt-2 mt-2">
                        <pre className="whitespace-pre-wrap text-xs text-gray-700">
                          {example.emailExample.content}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                
                {example.indicators && example.indicators.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Red Flags:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {example.indicators.map((indicator, idx) => (
                        <li key={idx}>{indicator}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleDetails;
