// Simple dashboard stats - no database needed
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  // Return mock dashboard data
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalReports: 156,
      totalUsers: 1247,
      pendingReports: 12,
      criticalReports: 3,
      resolvedReports: 141,
      categoryBreakdown: [
        { category: 'email_phishing', count: 89 },
        { category: 'social_media', count: 34 },
        { category: 'sms_phishing', count: 23 },
        { category: 'voice_phishing', count: 10 }
      ],
      recentReports: [
        {
          id: 1,
          title: 'Suspicious Email from IT',
          category: 'email_phishing',
          severity: 'high',
          status: 'investigating',
          created_at: new Date().toISOString(),
          user_name: 'John Doe'
        },
        {
          id: 2,
          title: 'Fake Banking SMS',
          category: 'sms_phishing',
          severity: 'critical',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_name: 'Jane Smith'
        },
        {
          id: 3,
          title: 'LinkedIn Scam Message',
          category: 'social_media',
          severity: 'medium',
          status: 'resolved',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_name: 'Mike Johnson'
        }
      ],
      trendingThreats: [
        { category: 'email_phishing', count: 45, max_severity: 'critical' },
        { category: 'social_media', count: 23, max_severity: 'high' },
        { category: 'sms_phishing', count: 12, max_severity: 'medium' }
      ]
    }),
  };
};
