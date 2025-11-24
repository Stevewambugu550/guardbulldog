// In-memory storage for education modules
const modules = [
  {
    id: 1,
    title: 'Introduction to Phishing',
    description: 'Learn the basics of phishing attacks and how to identify them',
    category: 'basics',
    difficulty: 'beginner',
    duration: 15,
    content: `
# Introduction to Phishing

## What is Phishing?

Phishing is a type of cyber attack where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, and personal data.

## Common Types of Phishing:

1. **Email Phishing** - Fraudulent emails pretending to be from trusted sources
2. **Spear Phishing** - Targeted attacks aimed at specific individuals or organizations
3. **Whaling** - Attacks targeting high-profile executives
4. **Smishing** - Phishing via SMS text messages
5. **Vishing** - Voice phishing through phone calls

## Warning Signs:

- ⚠️ Urgent or threatening language
- ⚠️ Requests for personal information
- ⚠️ Suspicious sender email addresses
- ⚠️ Poor grammar and spelling
- ⚠️ Unexpected attachments or links

## Key Takeaway:

Always verify the sender before clicking links or providing information. When in doubt, contact the organization directly through official channels.
    `,
    quiz_questions: [
      {
        question: 'What is phishing?',
        options: [
          'A type of fish',
          'A cyber attack that steals sensitive information',
          'A computer virus',
          'A software update'
        ],
        correctAnswer: 1
      },
      {
        question: 'Which is NOT a warning sign of phishing?',
        options: [
          'Urgent language',
          'Request for personal information',
          'Professional formatting',
          'Suspicious sender address'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 2,
    title: 'Identifying Phishing Emails',
    description: 'Master the skills to spot suspicious emails before they cause harm',
    category: 'identification',
    difficulty: 'beginner',
    duration: 20,
    content: `
# Identifying Phishing Emails

## Red Flags to Watch For:

### 1. Sender Analysis
- Check the email address carefully
- Look for misspellings or unusual domains
- Example: paypa1.com instead of paypal.com

### 2. Content Inspection
- Urgent calls to action
- Threats or intimidation tactics
- Too-good-to-be-true offers

### 3. Link Analysis
- Hover over links before clicking
- Check the actual URL destination
- Look for HTTPS and legitimate domains

### 4. Attachments
- Unexpected attachments are suspicious
- Never open attachments from unknown senders
- Scan all attachments with antivirus software

## Real Examples:

**Legitimate Email:**
- From: security@bowiestate.edu
- Professional formatting
- No urgent threats
- Links to official website

**Phishing Email:**
- From: security-alert@bowie-secure.com
- Poor formatting
- "Urgent: Account will be closed!"
- Links to suspicious websites

## Best Practices:

✅ Verify sender identity
✅ Check URLs before clicking
✅ Report suspicious emails
✅ Never share passwords via email
✅ Enable two-factor authentication
    `,
    quiz_questions: [
      {
        question: 'What should you do before clicking a link in an email?',
        options: [
          'Click it immediately',
          'Hover over it to check the URL',
          'Forward it to friends',
          'Delete the email'
        ],
        correctAnswer: 1
      },
      {
        question: 'What is a red flag in sender addresses?',
        options: [
          'Using @bowiestate.edu',
          'Misspellings like paypa1.com',
          'Professional formatting',
          'Having a name'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 3,
    title: 'Password Security Best Practices',
    description: 'Create strong passwords and protect your accounts',
    category: 'prevention',
    difficulty: 'beginner',
    duration: 10,
    content: `
# Password Security Best Practices

## Creating Strong Passwords:

### Requirements:
- ✅ At least 12 characters long
- ✅ Mix of uppercase and lowercase
- ✅ Include numbers
- ✅ Use special characters (!@#$%)
- ✅ Avoid dictionary words
- ✅ No personal information

### Examples:

**Weak:** password123
**Better:** P@ssw0rd2024
**Strong:** Tr!vx9#mK2$qL8pN

## Password Managers:

Benefits:
- Store all passwords securely
- Generate strong random passwords
- Auto-fill login forms
- Sync across devices

Recommended: LastPass, 1Password, Dashlane

## Two-Factor Authentication (2FA):

Add an extra layer of security:
1. Something you know (password)
2. Something you have (phone/token)

## Don'ts:

❌ Reuse passwords across sites
❌ Share passwords with others
❌ Write passwords on sticky notes
❌ Use "password" or "123456"
❌ Save passwords in browsers on shared computers
    `,
    quiz_questions: [
      {
        question: 'What makes a password strong?',
        options: [
          'Your birthday',
          'At least 12 characters with mixed case, numbers, and symbols',
          'Your name',
          'password123'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 4,
    title: 'Social Engineering Tactics',
    description: 'Understand how attackers manipulate people',
    category: 'identification',
    difficulty: 'intermediate',
    duration: 25,
    content: `
# Social Engineering Tactics

## What is Social Engineering?

Manipulating people into divulging confidential information or performing actions that compromise security.

## Common Tactics:

### 1. Pretexting
Creating a fabricated scenario to obtain information
- Impersonating IT support
- Fake surveys
- False emergencies

### 2. Baiting
Offering something enticing to lure victims
- Free software downloads
- USB drives left in public
- Prize notifications

### 3. Quid Pro Quo
Promising a benefit in exchange for information
- "Free tech support"
- Gift cards for survey completion

### 4. Tailgating
Following authorized personnel into restricted areas

### 5. Phishing
Fraudulent emails requesting information

## Protection Strategies:

🛡️ Verify identities before sharing information
🛡️ Question unexpected requests
🛡️ Follow organizational policies
🛡️ Report suspicious activities
🛡️ Never bypass security procedures
    `,
    quiz_questions: [
      {
        question: 'What is social engineering?',
        options: [
          'Building websites',
          'Manipulating people to reveal information',
          'Computer programming',
          'Network design'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 5,
    title: 'Responding to Phishing Attacks',
    description: 'Learn what to do if you encounter or fall victim to phishing',
    category: 'response',
    difficulty: 'intermediate',
    duration: 15,
    content: `
# Responding to Phishing Attacks

## If You Receive a Phishing Email:

### Immediate Actions:
1. ⚠️ Do NOT click any links
2. ⚠️ Do NOT download attachments
3. ⚠️ Do NOT reply to the email
4. ✅ Report it using GuardBulldog
5. ✅ Delete the email

## If You Clicked a Phishing Link:

### Steps to Take:
1. **Disconnect from network** - Stop potential malware spread
2. **Change passwords immediately** - All accounts, starting with critical ones
3. **Run antivirus scan** - Full system scan
4. **Report to IT Security** - Contact BSU IT department
5. **Monitor accounts** - Watch for suspicious activity
6. **Enable 2FA** - Add extra security layer

## If You Provided Information:

### Critical Actions:
1. ⚡ Contact your bank immediately
2. ⚡ Change all passwords
3. ⚡ File reports with IT and potentially police
4. ⚡ Place fraud alerts on credit reports
5. ⚡ Monitor financial statements

## Reporting Channels:

- **GuardBulldog**: Internal reporting system
- **IT Security**: security@bowiestate.edu
- **FTC**: reportfraud.ftc.gov
- **IC3**: ic3.gov

## Prevention Going Forward:

✅ Learn from the experience
✅ Complete security training
✅ Enable security features
✅ Stay vigilant
✅ Report suspicious activity
    `,
    quiz_questions: [
      {
        question: 'What should you do FIRST if you clicked a phishing link?',
        options: [
          'Ignore it',
          'Disconnect from the network',
          'Tell your friends',
          'Keep using your computer normally'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 6,
    title: 'Advanced Threat Detection',
    description: 'Deep dive into sophisticated phishing techniques',
    category: 'advanced',
    difficulty: 'advanced',
    duration: 30,
    content: `
# Advanced Threat Detection

## Sophisticated Phishing Techniques:

### 1. Domain Spoofing
- Homograph attacks using similar characters
- Example: bowíestate.edu vs bowiestate.edu
- Typosquatting on common misspellings

### 2. Email Header Analysis
Understanding email headers:
- Return-Path
- Received headers
- SPF, DKIM, DMARC records

### 3. SSL Certificate Inspection
- Not all HTTPS sites are legitimate
- Check certificate details
- Verify issuing authority

### 4. Business Email Compromise (BEC)
- Highly targeted attacks
- Impersonating executives
- Wire transfer fraud

## Technical Detection Methods:

### Email Authentication:
- SPF (Sender Policy Framework)
- DKIM (DomainKeys Identified Mail)
- DMARC (Domain-based Message Authentication)

### Link Analysis:
- URL structure examination
- Redirect chain inspection
- Blacklist checking

## Enterprise Solutions:

🔒 Email gateway filters
🔒 Advanced threat protection
🔒 Security awareness training
🔒 Incident response plans
🔒 Regular security audits
    `,
    quiz_questions: [
      {
        question: 'What is a homograph attack?',
        options: [
          'Using similar-looking characters in domain names',
          'Sending many emails',
          'Hacking passwords',
          'Social media attacks'
        ],
        correctAnswer: 0
      }
    ]
  }
];

// In-memory progress tracking
let userProgress = [];

// Get all education modules
exports.getModules = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let filteredModules = [...modules];
    
    if (category) {
      filteredModules = filteredModules.filter(m => m.category === category);
    }
    
    if (difficulty) {
      filteredModules = filteredModules.filter(m => m.difficulty === difficulty);
    }
    
    res.json({
      success: true,
      modules: filteredModules,
      count: filteredModules.length
    });
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({ message: 'Error retrieving modules' });
  }
};

// Get single module
exports.getModuleById = async (req, res) => {
  try {
    const module = modules.find(m => m.id === parseInt(req.params.id));
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({ message: 'Error retrieving module' });
  }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    const { answers } = req.body;
    const userId = req.user.id;
    
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Calculate score
    let correct = 0;
    module.quiz_questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / module.quiz_questions.length) * 100);
    const passed = score >= 70;
    
    // Update progress
    const progressIndex = userProgress.findIndex(
      p => p.userId === userId && p.moduleId === moduleId
    );
    
    const progressEntry = {
      userId,
      moduleId,
      completed: passed,
      score,
      completedAt: new Date().toISOString()
    };
    
    if (progressIndex >= 0) {
      userProgress[progressIndex] = progressEntry;
    } else {
      userProgress.push(progressEntry);
    }
    
    res.json({
      success: true,
      score,
      passed,
      correct,
      total: module.quiz_questions.length
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
};

// Get user progress
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = userProgress.filter(p => p.userId === userId);
    
    const stats = {
      totalModules: modules.length,
      completed: progress.filter(p => p.completed).length,
      inProgress: progress.filter(p => !p.completed).length,
      averageScore: progress.length > 0
        ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
        : 0
    };
    
    res.json({
      success: true,
      progress,
      stats
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ message: 'Error retrieving progress' });
  }
};

module.exports = exports;
