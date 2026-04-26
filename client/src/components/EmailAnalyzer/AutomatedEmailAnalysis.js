import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const AutomatedEmailAnalysis = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const parseEmailHeaders = (content) => {
    const lines = content.split('\n');
    const headers = {};
    const headerEndIndex = lines.findIndex(line => line.trim() === '');
    
    for (let i = 0; i < headerEndIndex; i++) {
      const line = lines[i];
      if (line.match(/^[A-Za-z-]+:/)) {
        const [key, ...valueParts] = line.split(':');
        headers[key.toLowerCase().trim()] = valueParts.join(':').trim();
      } else if (line.startsWith(' ') || line.startsWith('\t')) {
        // Continuation of previous header
        const lastKey = Object.keys(headers).slice(-1)[0];
        if (lastKey) {
          headers[lastKey] += ' ' + line.trim();
        }
      }
    }
    
    const body = lines.slice(headerEndIndex + 1).join('\n');
    
    return {
      headers,
      body: body.trim(),
      from: headers['from'] || '',
      to: headers['to'] || '',
      subject: headers['subject'] || '',
      date: headers['date'] || '',
      messageId: headers['message-id'] || '',
      returnPath: headers['return-path'] || '',
      received: headers['received'] || ''
    };
  };

  const analyzeUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
    const urls = text.match(urlRegex) || [];
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co/i,
      /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/,
      /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\./i,
      /[0-9]{4,}/
    ];
    
    return urls.map(url => {
      const suspicious = suspiciousPatterns.some(pattern => pattern.test(url));
      return {
        url,
        suspicious,
        reason: suspicious ? 'Suspicious URL pattern detected' : 'URL appears normal'
      };
    });
  };

  const analyzeContent = (parsedEmail) => {
    const { headers, body, from, subject } = parsedEmail;
    const fullText = subject + ' ' + body;
    
    // Phishing indicators
    const phishingKeywords = [
      'urgent', 'immediate action', 'verify account', 'suspended account',
      'click here', 'act now', 'limited time', 'expire', 'confirm identity',
      'update payment', 'prize', 'winner', 'congratulations', 'tax refund',
      'inheritance', 'lottery', 'million dollars', 'wire transfer'
    ];
    
    const grammarErrors = [
      /\b(recieve|seperate|definately|occured)\b/gi,
      /\s{2,}/g,
      /[.]{2,}/g
    ];
    
    const urgencyWords = ['urgent', 'immediate', 'expires', 'deadline', 'act now'];
    
    // Analysis scoring
    let riskScore = 0;
    const indicators = [];
    
    // Check phishing keywords
    const foundKeywords = phishingKeywords.filter(keyword => 
      fullText.toLowerCase().includes(keyword.toLowerCase())
    );
    if (foundKeywords.length > 0) {
      riskScore += foundKeywords.length * 10;
      indicators.push({
        type: 'phishing_keywords',
        severity: 'medium',
        message: `Contains suspicious keywords: ${foundKeywords.join(', ')}`
      });
    }
    
    // Check URLs
    const urlAnalysis = analyzeUrls(fullText);
    const suspiciousUrls = urlAnalysis.filter(u => u.suspicious);
    if (suspiciousUrls.length > 0) {
      riskScore += suspiciousUrls.length * 15;
      indicators.push({
        type: 'suspicious_urls',
        severity: 'high',
        message: `Contains ${suspiciousUrls.length} suspicious URL(s)`
      });
    }
    
    // Check sender authentication
    if (!headers['dkim-signature'] && !headers['spf']) {
      riskScore += 20;
      indicators.push({
        type: 'no_authentication',
        severity: 'medium',
        message: 'Email lacks proper authentication (DKIM/SPF)'
      });
    }
    
    // Check domain mismatch
    if (from && headers['return-path']) {
      const fromDomain = from.match(/@([^>]+)/)?.[1];
      const returnPathDomain = headers['return-path'].match(/@([^>]+)/)?.[1];
      if (fromDomain && returnPathDomain && fromDomain !== returnPathDomain) {
        riskScore += 25;
        indicators.push({
          type: 'domain_mismatch',
          severity: 'high',
          message: 'Sender domain does not match return path domain'
        });
      }
    }
    
    // Check urgency tactics
    const foundUrgencyWords = urgencyWords.filter(word => 
      fullText.toLowerCase().includes(word.toLowerCase())
    );
    if (foundUrgencyWords.length > 1) {
      riskScore += 15;
      indicators.push({
        type: 'urgency_tactics',
        severity: 'medium',
        message: 'Uses urgency tactics to pressure quick action'
      });
    }
    
    // Grammar and spelling errors
    const grammarIssues = grammarErrors.filter(pattern => pattern.test(fullText));
    if (grammarIssues.length > 0) {
      riskScore += 10;
      indicators.push({
        type: 'grammar_errors',
        severity: 'low',
        message: 'Contains grammar or formatting errors'
      });
    }
    
    // Determine threat level
    let threatLevel = 'legitimate';
    let threatColor = 'green';
    
    if (riskScore >= 70) {
      threatLevel = 'phishing';
      threatColor = 'red';
    } else if (riskScore >= 50) {
      threatLevel = 'malware';
      threatColor = 'red';
    } else if (riskScore >= 30) {
      threatLevel = 'suspicious';
      threatColor = 'orange';
    } else if (riskScore >= 15) {
      threatLevel = 'spam';
      threatColor = 'yellow';
    }
    
    return {
      riskScore: Math.min(riskScore, 100),
      threatLevel,
      threatColor,
      indicators,
      urlAnalysis,
      recommendation: riskScore >= 50 
        ? 'Do NOT click any links or download attachments. Report to IT Security.' 
        : riskScore >= 30 
        ? 'Exercise caution. Verify sender before taking any action.'
        : 'Email appears legitimate, but always remain vigilant.'
    };
  };

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      setError('Please paste email content to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Parse email content
      const parsedEmail = parseEmailHeaders(emailContent);
      
      // Perform analysis
      const analysis = analyzeContent(parsedEmail);
      
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysisResult({
        ...analysis,
        parsedEmail,
        timestamp: new Date().toISOString()
      });
      
      toast.success('Email analysis completed!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze email. Please check the format and try again.');
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setEmailContent('');
    setAnalysisResult(null);
    setError('');
  };

  const getThreatIcon = (threatLevel) => {
    switch (threatLevel) {
      case 'phishing':
      case 'malware':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case 'suspicious':
        return <ExclamationCircleIcon className="h-8 w-8 text-orange-500" />;
      case 'spam':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <MagnifyingGlassIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Automated Email Analysis</h1>
        </div>
        <p className="text-gray-600">
          Paste your complete email (including headers) below for instant automated security analysis.
          Our AI will check for phishing indicators, malicious URLs, and authentication issues.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">How to get email headers:</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Gmail:</strong> Open email → Three dots menu → "Show original" → Copy all content</li>
                <li><strong>Outlook:</strong> Open email → File → Properties → Copy "Internet headers" + message content</li>
                <li><strong>Apple Mail:</strong> View → Message → Raw Source → Copy all content</li>
                <li><strong>Thunderbird:</strong> View → Message Source → Copy all content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
              Email Content
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-2">
                Paste Complete Email (Headers + Body)
              </label>
              <textarea
                id="emailContent"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Paste your complete email here including headers...

Example:
From: sender@example.com
To: recipient@company.com
Subject: Urgent Account Verification Required
Date: Mon, 1 Jan 2024 12:00:00 +0000
Message-ID: <12345@example.com>

Dear Customer,

Your account requires immediate verification..."
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !emailContent.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Analyze Email
                  </>
                )}
              </button>
              
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Analysis Results
            </h2>
          </div>

          {!analysisResult ? (
            <div className="text-center py-12 text-gray-500">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Analysis Yet</p>
              <p className="text-sm">Paste an email and click "Analyze Email" to see results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Threat Level Summary */}
              <div className={`p-4 rounded-lg border-2 ${
                analysisResult.threatColor === 'red' ? 'bg-red-50 border-red-200' :
                analysisResult.threatColor === 'orange' ? 'bg-orange-50 border-orange-200' :
                analysisResult.threatColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center mb-3">
                  {getThreatIcon(analysisResult.threatLevel)}
                  <div className="ml-3">
                    <h3 className="text-lg font-bold capitalize">{analysisResult.threatLevel}</h3>
                    <p className="text-sm font-medium">Risk Score: {analysisResult.riskScore}/100</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className={`h-3 rounded-full ${
                      analysisResult.threatColor === 'red' ? 'bg-red-500' :
                      analysisResult.threatColor === 'orange' ? 'bg-orange-500' :
                      analysisResult.threatColor === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${analysisResult.riskScore}%` }}
                  />
                </div>
                
                <p className="text-sm font-medium">{analysisResult.recommendation}</p>
              </div>

              {/* Security Indicators */}
              {analysisResult.indicators.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Security Indicators</h4>
                  <div className="space-y-2">
                    {analysisResult.indicators.map((indicator, index) => (
                      <div key={index} className={`flex items-start p-3 rounded-lg ${
                        indicator.severity === 'high' ? 'bg-red-50 border border-red-200' :
                        indicator.severity === 'medium' ? 'bg-orange-50 border border-orange-200' :
                        'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className={`flex-shrink-0 h-2 w-2 rounded-full mt-2 mr-3 ${
                          indicator.severity === 'high' ? 'bg-red-400' :
                          indicator.severity === 'medium' ? 'bg-orange-400' :
                          'bg-yellow-400'
                        }`} />
                        <p className="text-sm text-gray-700">{indicator.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Analysis */}
              {analysisResult.urlAnalysis.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">URLs Found ({analysisResult.urlAnalysis.length})</h4>
                  <div className="space-y-2">
                    {analysisResult.urlAnalysis.map((urlInfo, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        urlInfo.suspicious ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <p className="text-sm font-mono break-all text-gray-700">{urlInfo.url}</p>
                        <p className={`text-xs mt-1 ${urlInfo.suspicious ? 'text-red-600' : 'text-gray-500'}`}>
                          {urlInfo.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Email Details</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div><strong>From:</strong> {analysisResult.parsedEmail.from || 'Not specified'}</div>
                  <div><strong>Subject:</strong> {analysisResult.parsedEmail.subject || 'No subject'}</div>
                  <div><strong>Date:</strong> {analysisResult.parsedEmail.date || 'Not specified'}</div>
                  {analysisResult.parsedEmail.returnPath && (
                    <div><strong>Return-Path:</strong> {analysisResult.parsedEmail.returnPath}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/app/report-phishing')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
                >
                  Report as Threat
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
                >
                  Analyze Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomatedEmailAnalysis;
