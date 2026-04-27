const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

  const { firstName, lastName, email, phone, password, department } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if phone already registered (if provided)
    if (phone) {
      const phoneUser = await User.findByPhone(phone);
      if (phoneUser) {
        return res.status(400).json({ message: 'This phone number is already registered' });
      }
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
      phone: phone || null,
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

// Login user - Supports email OR phone number
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, phone, identifier, password } = req.body;
  
  // Support multiple login methods: email, phone, or identifier (either)
  const loginIdentifier = identifier || email || phone;

  try {
    // Find user by email or phone
    let user = null;
    
    // Check if it looks like an email (contains @)
    if (loginIdentifier && loginIdentifier.includes('@')) {
      user = await User.findByEmail(loginIdentifier);
    } else if (loginIdentifier) {
      // Try to find by phone first, then by email
      user = await User.findByPhone(loginIdentifier);
      if (!user) {
        user = await User.findByEmail(loginIdentifier);
      }
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
    }

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
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
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

// Google OAuth Sign In
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Decode the Google JWT token (Node.js compatible)
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const googleUser = JSON.parse(jsonPayload);

    const { email, given_name, family_name, picture, email_verified } = googleUser;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in Google account' });
    }

    // Optionally verify email is from allowed domain
    // Uncomment for production to restrict to Bowie State emails
    // const allowedDomains = ['bowie.edu', 'bowiestate.edu', 'gmail.com'];
    // const emailDomain = email.split('@')[1];
    // if (!allowedDomains.includes(emailDomain)) {
    //   return res.status(400).json({ message: 'Only Bowie State University or Gmail accounts are allowed' });
    // }

    // Check if user exists
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user from Google account
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        firstName: given_name || 'Google',
        lastName: family_name || 'User',
        email,
        password: hashedPassword,
        role: 'user',
        department: 'Not Specified'
      });
      console.log('✅ New user created via Google Sign-In:', email);
    } else {
      console.log('✅ Existing user logged in via Google:', email);
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'guardbulldog_default_secret_key_2024', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        picture: picture || null
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed. Please try again.' });
  }
};

// In-memory password reset tokens (for when DB is unavailable)
const resetTokens = new Map();

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByEmail(email);

    // Always return generic message to prevent email enumeration
    const genericMsg = 'If an account with that email exists, a reset token has been generated.';

    if (!user) {
      return res.json({ message: genericMsg });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store token (in-memory or DB)
    if (User._useInMemory || false) {
      resetTokens.set(resetToken, {
        email,
        expiresAt: Date.now() + 60 * 60 * 1000
      });
    } else {
      try {
        const pool = require('../config/database');
        await pool.query(`CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          used BOOLEAN DEFAULT FALSE,
          "expiresAt" TIMESTAMPTZ NOT NULL,
          "createdAt" TIMESTAMPTZ DEFAULT NOW()
        )`);
        await pool.query('UPDATE password_resets SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);
        await pool.query('INSERT INTO password_resets (email, token, "expiresAt") VALUES ($1, $2, $3)', [email, resetToken, new Date(Date.now() + 60 * 60 * 1000)]);
      } catch (dbErr) {
        // Fallback to in-memory
        resetTokens.set(resetToken, { email, expiresAt: Date.now() + 60 * 60 * 1000 });
      }
    }

    res.json({
      message: genericMsg,
      token: resetToken,
      email
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error processing request' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let email = null;

    // Check in-memory tokens first
    const memToken = resetTokens.get(token);
    if (memToken) {
      if (memToken.expiresAt < Date.now()) {
        resetTokens.delete(token);
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      email = memToken.email;
      resetTokens.delete(token);
    } else {
      // Check DB
      try {
        const pool = require('../config/database');
        const result = await pool.query(
          'SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND "expiresAt" > NOW()',
          [token]
        );
        if (result.rows.length === 0) {
          return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        email = result.rows[0].email;
        await pool.query('UPDATE password_resets SET used = TRUE WHERE token = $1', [token]);
      } catch (dbErr) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
    }

    // Update password
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.updatePassword(user.id, hashedPassword);

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};
