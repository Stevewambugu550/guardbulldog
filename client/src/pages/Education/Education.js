import React, { useState } from 'react';
import {
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const Education = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [filter, setFilter] = useState('all');

  const modules = [
    {
      id: 1, title: 'Introduction to Phishing', category: 'basics', difficulty: 'beginner', duration: 15,
      description: 'Learn what phishing is and why it is dangerous',
      content: `## What is Phishing?\nPhishing is a cyber attack where criminals impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, and personal data.\n\n## Why is it Dangerous?\n• 90% of data breaches involve phishing\n• Causes billions in losses annually\n• Can lead to identity theft\n• Opens doors for malware\n\n## Types of Phishing:\n1. **Email Phishing** - Fake emails from "banks" or "services"\n2. **Spear Phishing** - Targeted attacks on specific people\n3. **Whaling** - Attacks on executives (CEOs, CFOs)\n4. **Smishing** - SMS text message phishing\n5. **Vishing** - Voice/phone call phishing`,
      quiz: [
        { q: 'What percentage of data breaches involve phishing?', o: ['50%', '70%', '90%', '30%'], a: 2 },
        { q: 'What is spear phishing?', o: ['Mass emails', 'Targeted attacks on specific people', 'Phone calls', 'Social media scams'], a: 1 },
        { q: 'What is whaling?', o: ['Attacks on fishing companies', 'Attacks targeting executives', 'Spam campaigns', 'Deep web attacks'], a: 1 }
      ]
    },
    {
      id: 2, title: 'Identifying Phishing Emails', category: 'identification', difficulty: 'beginner', duration: 20,
      description: 'Master techniques to spot suspicious emails',
      content: `## Red Flags in Emails:\n\n### Sender Address\n• Misspelled domains: support@amaz0n.com\n• Extra characters: security@paypal-support.com\n• Generic senders with no company name\n\n### Content Warning Signs\n• **Urgent language**: "Act immediately!"\n• **Threats**: "Account will be suspended"\n• **Too good to be true**: "You won $1M!"\n• **Poor grammar** and spelling errors\n• **Generic greetings**: "Dear Customer"\n\n### Links & Attachments\n• Hover over links to see actual URL\n• Be wary of .exe, .zip, .scr files\n• Never open unexpected attachments`,
      quiz: [
        { q: 'What should you do before clicking a link?', o: ['Click immediately', 'Hover to see actual URL', 'Forward to friends', 'Reply to sender'], a: 1 },
        { q: 'Which is a phishing red flag?', o: ['Your full name used', 'Company logo present', 'Urgent threats about suspension', 'Correct spelling'], a: 2 },
        { q: 'Which domain is suspicious?', o: ['support@amazon.com', 'help@amaz0n-support.com', 'service@chase.com', 'info@microsoft.com'], a: 1 }
      ]
    },
    {
      id: 3, title: 'Safe Browsing Practices', category: 'prevention', difficulty: 'beginner', duration: 15,
      description: 'Essential habits for secure internet browsing',
      content: `## Website Security Checks:\n• Look for HTTPS padlock icon\n• Verify the domain is correct\n• Check for trust seals\n• Be cautious of aggressive pop-ups\n\n## Browser Settings:\n• Enable pop-up blockers\n• Turn on Safe Browsing features\n• Keep browser updated\n• Clear cookies regularly\n\n## Fake Website Signs:\n• Misspelled URLs (goggle.com)\n• Poor design quality\n• Missing contact information\n• Prices too good to be true\n\n## Download Safety:\n• Only download from official sites\n• Scan files with antivirus\n• Avoid pirated software`,
      quiz: [
        { q: 'What does HTTPS indicate?', o: ['Site is 100% safe', 'Data is encrypted', 'Government approved', 'Free from malware'], a: 1 },
        { q: 'Sign of a fake website?', o: ['Professional design', 'Contact info available', 'Misspelled domain', 'Clear privacy policy'], a: 2 },
        { q: 'Where to download software?', o: ['Any free site', 'Torrent sites', 'Official websites only', 'Email attachments'], a: 2 }
      ]
    },
    {
      id: 4, title: 'Password Security', category: 'prevention', difficulty: 'intermediate', duration: 20,
      description: 'Create and manage secure passwords',
      content: `## Strong Password Rules:\n• Minimum 12-16 characters\n• Mix uppercase & lowercase\n• Include numbers and symbols\n• No personal info (birthdays)\n• No dictionary words\n\n**GOOD**: K9#mP2$xLn8@vQ4\n**BAD**: password123, john1990\n\n## Password Managers:\n• Bitwarden (Free)\n• 1Password\n• LastPass\n• Generate unique passwords automatically\n\n## Multi-Factor Authentication:\n1. SMS codes (least secure)\n2. Authenticator apps (recommended)\n3. Hardware keys (most secure)\n\n## Password Hygiene:\n• Use unique passwords per site\n• Change passwords after breaches\n• Never share via email/text\n• Check haveibeenpwned.com`,
      quiz: [
        { q: 'Minimum recommended password length?', o: ['6 characters', '8 characters', '12 characters', '4 characters'], a: 2 },
        { q: 'Most secure MFA?', o: ['SMS codes', 'Email codes', 'Hardware security keys', 'Security questions'], a: 2 },
        { q: 'Which password is strongest?', o: ['password123', 'John1990!', 'K9#mP2$xLn8@vQ4', 'qwerty2024'], a: 2 }
      ]
    },
    {
      id: 5, title: 'Social Engineering', category: 'advanced', difficulty: 'intermediate', duration: 25,
      description: 'Understand psychological manipulation techniques',
      content: `## What is Social Engineering?\nManipulating people to reveal confidential info. Attackers "hack" humans, not computers.\n\n## Common Techniques:\n\n**1. PRETEXTING**\nCreating fake scenarios\nExample: "I'm from IT, need your password"\n\n**2. BAITING**\nOffering something enticing\nExample: USB drives labeled "Salary Info"\n\n**3. QUID PRO QUO**\nOffering services for info\nExample: "I'll fix your PC for remote access"\n\n**4. TAILGATING**\nFollowing into restricted areas\n\n**5. BEC (Business Email Compromise)**\nCEO fraud, invoice manipulation\nCost: $2.7 billion in 2022!\n\n## Defense:\n• Verify requests independently\n• Question urgency\n• Report suspicious contacts`,
      quiz: [
        { q: 'What is pretexting?', o: ['Mass emails', 'Creating fake scenario to extract info', 'Installing malware', 'Guessing passwords'], a: 1 },
        { q: 'What is baiting?', o: ['Fishing for passwords', 'Offering something enticing for malware', 'Following into buildings', 'Phone calls'], a: 1 },
        { q: 'BEC scam losses in 2022?', o: ['$500 million', '$1 billion', '$2.7 billion', '$100 million'], a: 2 }
      ]
    },
    {
      id: 6, title: 'Mobile Device Security', category: 'prevention', difficulty: 'intermediate', duration: 20,
      description: 'Protect smartphones from phishing attacks',
      content: `## Why Mobile is Vulnerable:\n• Smaller screens hide URLs\n• Users often distracted\n• SMS phishing very effective\n• Apps can be spoofed\n\n## Secure Your Device:\n• Use 6+ digit PIN or biometrics\n• Enable auto-lock (30 seconds)\n• Keep OS and apps updated\n• Download only from official stores\n\n## Mobile Scams:\n\n**SMS Scams:**\n• "Package delivery failed"\n• "Bank account locked"\n• "You've won a prize!"\n\n**App Scams:**\n• Apps requesting too many permissions\n• Apps mimicking popular brands\n\n## Public WiFi:\n• Avoid sensitive tasks\n• Use VPN\n• Disable auto-connect`,
      quiz: [
        { q: 'Why are mobiles vulnerable?', o: ['They are faster', 'Small screens hide URLs', 'Better security', 'Cost more'], a: 1 },
        { q: 'Where to download apps?', o: ['Any website', 'Email attachments', 'Official app stores', 'Text links'], a: 2 },
        { q: 'What to do on public WiFi?', o: ['Check bank', 'Use VPN', 'Share passwords', 'Download apps'], a: 1 }
      ]
    },
    {
      id: 7, title: 'Email Security Configuration', category: 'prevention', difficulty: 'intermediate', duration: 18,
      description: 'Configure email for maximum security',
      content: `## Email Settings:\n• Enable aggressive spam filtering\n• Disable automatic image loading\n• Show full email addresses\n• Block dangerous file types\n• Enable link scanning\n\n## Organization Security:\n• **SPF**: Verifies sender IPs\n• **DKIM**: Cryptographic signing\n• **DMARC**: Policy enforcement\n• External email warnings\n\n## Handling Suspicious Emails:\n\n**DO:**\n• Report using official tool\n• Forward to IT security\n• Delete after reporting\n\n**DON'T:**\n• Click links\n• Open attachments\n• Reply to sender\n• Click unsubscribe\n\n## If You Clicked:\n1. Disconnect from network\n2. Don't enter credentials\n3. Report to IT immediately`,
      quiz: [
        { q: 'What is SPF?', o: ['Spam Protection Filter', 'Sender Policy Framework', 'Secure Protocol', 'System Firewall'], a: 1 },
        { q: 'What to do with suspicious email?', o: ['Reply for info', 'Click unsubscribe', 'Report and delete', 'Forward to all'], a: 2 },
        { q: 'Why disable image loading?', o: ['Save battery', 'Images track if opened', 'Faster loading', 'Images boring'], a: 1 }
      ]
    },
    {
      id: 8, title: 'Incident Response', category: 'response', difficulty: 'intermediate', duration: 20,
      description: 'What to do if you fall victim',
      content: `## Immediate Steps:\n1. **STOP** - Don't interact further\n2. **DISCONNECT** - Remove from network\n3. **DOCUMENT** - Screenshot everything\n4. **REPORT** - Contact IT security\n5. **DON'T PANIC** - Quick action helps\n\n## Account Recovery:\n• Change passwords (from clean device)\n• Enable MFA everywhere\n• Review account activity\n• Log out all sessions\n• Revoke third-party access\n\n## Financial Protection:\n• Call card issuer immediately\n• Contact bank fraud department\n• Place fraud alerts with credit bureaus\n• Consider credit freeze\n• File report at IdentityTheft.gov\n\n## Reporting:\n• FTC: ReportFraud.ftc.gov\n• FBI IC3: ic3.gov\n• Local law enforcement`,
      quiz: [
        { q: 'First thing after clicking phishing link?', o: ['Fix yourself', 'Delete email', 'Disconnect from network', 'Ignore it'], a: 2 },
        { q: 'Where to report identity theft?', o: ['Social media', 'IdentityTheft.gov', 'Phishing sender', 'Nowhere'], a: 1 },
        { q: 'Credit card info stolen - what to do?', o: ['Wait and see', 'Call issuer immediately', 'Test the card', 'Post online'], a: 1 }
      ]
    },
    {
      id: 9, title: 'Workplace Security', category: 'advanced', difficulty: 'advanced', duration: 22,
      description: 'Protect yourself and organization at work',
      content: `## High-Value Targets:\n• Finance (wire fraud)\n• HR (employee data)\n• IT (system access)\n• Executives (whaling)\n• New employees\n\n## Common Workplace Attacks:\n• Fake invoice scams\n• CEO fraud / BEC\n• Payroll diversion\n• IT support impersonation\n\n## Secure Practices:\n\n**Physical:**\n• Lock computer (Win+L)\n• Shred sensitive documents\n• Challenge unknown visitors\n\n**Digital:**\n• Follow security policies\n• Use approved tools only\n• Report suspicious emails\n• Verify unusual requests\n\n## Verifying Requests:\n• Call using KNOWN numbers\n• Require dual authorization\n• Never bypass processes\n• Document everything`,
      quiz: [
        { q: 'Most targeted for wire fraud?', o: ['Marketing', 'Finance', 'Reception', 'Maintenance'], a: 1 },
        { q: 'How to verify wire transfer?', o: ['Reply to email', 'Call known number', 'Process quickly', 'Forward to colleague'], a: 1 },
        { q: 'Before leaving desk?', o: ['Nothing', 'Lock computer', 'Turn off lights', 'Email password'], a: 1 }
      ]
    },
    {
      id: 10, title: 'Advanced Phishing Techniques', category: 'advanced', difficulty: 'advanced', duration: 25,
      description: 'Sophisticated attacks and defenses',
      content: `## Advanced Attacks:\n\n**AI-Generated Phishing:**\n• Deepfake audio/video\n• AI-written perfect emails\n• Personalized from social media\n\n**Man-in-the-Middle:**\n• Real-time credential theft\n• Session hijacking\n• Can bypass basic MFA!\n\n**Supply Chain Attacks:**\n• Compromised software updates\n• Trusted vendor impersonation\n• Third-party breaches\n\n## Defense Strategies:\n\n• Use hardware security keys\n• Enable phishing-resistant MFA\n• Verify through multiple channels\n• Monitor for anomalies\n• Regular security training\n• Keep systems updated\n• Zero-trust architecture\n\n## Stay Informed:\n• Follow security news\n• Subscribe to threat alerts\n• Participate in simulations`,
      quiz: [
        { q: 'What can bypass basic MFA?', o: ['Strong password', 'Man-in-the-middle attack', 'Antivirus', 'Firewall'], a: 1 },
        { q: 'Best defense against advanced phishing?', o: ['Ignore all emails', 'Hardware security keys', 'Use same password', 'Disable updates'], a: 1 },
        { q: 'What is a supply chain attack?', o: ['Shipping fraud', 'Attack through trusted vendors', 'Warehouse theft', 'Delivery scams'], a: 1 }
      ]
    }
  ];

  const getDifficultyColor = (d) => ({ beginner: 'bg-green-100 text-green-800', intermediate: 'bg-yellow-100 text-yellow-800', advanced: 'bg-red-100 text-red-800' }[d] || 'bg-gray-100');
  const getCategoryIcon = (c) => ({ basics: '📚', identification: '🔍', prevention: '🛡️', response: '⚡', advanced: '🎓' }[c] || '📖');
  const filteredModules = filter === 'all' ? modules : modules.filter(m => m.category === filter || m.difficulty === filter);

  const handleQuizAnswer = (qi, ai) => setQuizAnswers(p => ({ ...p, [qi]: ai }));
  const calculateScore = () => {
    if (!selectedModule) return 0;
    let correct = 0;
    selectedModule.quiz.forEach((q, i) => { if (quizAnswers[i] === q.a) correct++; });
    return Math.round((correct / selectedModule.quiz.length) * 100);
  };

  if (selectedModule) {
    return (
      <div className="space-y-6">
        <button onClick={() => { setSelectedModule(null); setShowQuiz(false); setQuizAnswers({}); setQuizSubmitted(false); }}
          className="text-blue-600 hover:text-blue-800 flex items-center">
          ← Back to all modules
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{getCategoryIcon(selectedModule.category)}</span>
            <div>
              <h1 className="text-2xl font-bold">{selectedModule.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedModule.difficulty)}`}>
                  {selectedModule.difficulty}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />{selectedModule.duration} min
                </span>
              </div>
            </div>
          </div>

          {!showQuiz ? (
            <>
              <div className="prose max-w-none mt-6 bg-gray-50 p-6 rounded-lg whitespace-pre-line text-sm leading-relaxed">
                {selectedModule.content}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowQuiz(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  📝 Take Quiz
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
                Knowledge Check
              </h2>
              
              {selectedModule.quiz.map((q, qi) => (
                <div key={qi} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-3">{qi + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.o.map((opt, oi) => (
                      <label key={oi} className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all
                        ${quizSubmitted 
                          ? oi === q.a ? 'bg-green-100 border-green-500' 
                            : quizAnswers[qi] === oi ? 'bg-red-100 border-red-500' : 'border-gray-200'
                          : quizAnswers[qi] === oi ? 'bg-blue-100 border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                        <input type="radio" name={`q${qi}`} disabled={quizSubmitted}
                          checked={quizAnswers[qi] === oi} onChange={() => handleQuizAnswer(qi, oi)}
                          className="mr-3" />
                        <span>{opt}</span>
                        {quizSubmitted && oi === q.a && <CheckCircleIcon className="h-5 w-5 text-green-600 ml-auto" />}
                        {quizSubmitted && quizAnswers[qi] === oi && oi !== q.a && <XCircleIcon className="h-5 w-5 text-red-600 ml-auto" />}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {!quizSubmitted ? (
                <button onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length !== selectedModule.quiz.length}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400">
                  Submit Quiz
                </button>
              ) : (
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <TrophyIcon className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                  <h3 className="text-2xl font-bold">Your Score: {calculateScore()}%</h3>
                  <p className="text-gray-600 mt-2">
                    {calculateScore() >= 70 ? '🎉 Great job! You passed!' : '📚 Review the material and try again!'}
                  </p>
                  <button onClick={() => { setShowQuiz(false); setQuizAnswers({}); setQuizSubmitted(false); }}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Back to Content
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <AcademicCapIcon className="h-10 w-10 mr-4" />
          <div>
            <h1 className="text-2xl font-bold">🎓 Education Center</h1>
            <p className="text-purple-100">10 Comprehensive Modules with Quizzes</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'beginner', 'intermediate', 'advanced', 'prevention'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map(m => (
          <div key={m.id} onClick={() => setSelectedModule(m)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{getCategoryIcon(m.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(m.difficulty)}`}>
                  {m.difficulty}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{m.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{m.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />{m.duration} min
                </span>
                <span className="text-blue-600 font-medium">📝 {m.quiz.length} Questions</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <BookOpenIcon className="h-5 w-5 mr-2" />Learning Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <span className="text-green-600 font-bold">🌱 Beginner</span>
            <p className="mt-2">Start with basics: Introduction, Identification, Safe Browsing</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <span className="text-yellow-600 font-bold">📈 Intermediate</span>
            <p className="mt-2">Build skills: Passwords, Mobile, Email Security</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <span className="text-red-600 font-bold">🎯 Advanced</span>
            <p className="mt-2">Master: Social Engineering, Workplace, Advanced Techniques</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
