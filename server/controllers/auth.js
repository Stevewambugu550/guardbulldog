const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

// Email transporter (using Gmail or any SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'guardbulldog.bsu@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: '"GuardBulldog Security" <guardbulldog.bsu@gmail.com>',
      to: email,
      subject: '🔐 Your GuardBulldog Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🛡️ GuardBulldog</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Bowie State University</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Your Verification Code</h2>
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${code}</span>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `
    });
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.log('⚠️ Email sending failed:', error.message);
    return false;
  }
};

// Register new user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, department } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Email validation (relaxed for development/testing)
    // Uncomment below for production with Bowie State emails only
    // if (!email.endsWith('@bowie.edu') && !email.endsWith('@bowiestate.edu')) {
    //   return res.status(400).json({ message: 'Only Bowie State University email addresses are allowed' });
    // }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'user',
      department: department || 'Not Specified'
    });

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'guardbulldog_default_secret_key_2024', { expiresIn: '7d' });

    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user - Step 1: Verify credentials and send code
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, verificationCode } = req.body;

  try {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If verification code provided, verify it
    if (verificationCode) {
      const storedData = verificationCodes.get(email);
      if (!storedData || storedData.code !== verificationCode) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      if (Date.now() > storedData.expires) {
        verificationCodes.delete(email);
        return res.status(400).json({ message: 'Verification code expired' });
      }
      
      // Code verified! Delete it and complete login
      verificationCodes.delete(email);
      
      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
          email: user.email
        }
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'guardbulldog_default_secret_key_2024', { expiresIn: '7d' });

      // Return token and user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        token,
        user: userWithoutPassword,
        verified: true
      });
    }

    // No code provided - generate and send one
    const code = generateCode();
    verificationCodes.set(email, {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Try to send email
    const emailSent = await sendVerificationEmail(email, code);
    
    // For demo/development: if email fails, still allow login with code shown in console
    console.log(`🔐 Verification code for ${email}: ${code}`);

    res.json({
      requiresVerification: true,
      message: emailSent 
        ? 'Verification code sent to your email' 
        : 'Check console for verification code (email service not configured)',
      email: email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Resend verification code
exports.resendCode = async (req, res) => {
  const { email } = req.body;
  
  const code = generateCode();
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000
  });

  const emailSent = await sendVerificationEmail(email, code);
  console.log(`🔐 New verification code for ${email}: ${code}`);

  res.json({
    message: emailSent ? 'New code sent to your email' : 'Check console for code',
    success: true
  });
};

// Verify token and get current user
exports.verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, department } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.update(req.user.id, {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      department: department || user.department
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.updatePassword(req.user.id, hashedPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
