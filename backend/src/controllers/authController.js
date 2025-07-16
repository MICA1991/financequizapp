import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

// Azure AD authentication
export const azureAdLogin = async (req, res) => {
  try {
    const { accessToken, account } = req.body;

    if (!accessToken || !account) {
      return res.status(400).json({
        success: false,
        message: 'Access token and account information are required'
      });
    }

    // Extract user information from Azure AD account
    const azureAdData = {
      azureAdId: account.localAccountId || account.homeAccountId,
      email: account.username || account.name,
      displayName: account.name || account.username,
      tenantId: account.tenantId
    };

    // Create or update user in database
    let user;
    try {
      user = await User.createOrUpdateAzureAdUser(azureAdData);
      console.log('[AZURE LOGIN] User created/updated:', JSON.stringify(user, null, 2));
    } catch (error) {
      console.error('Error creating/updating Azure AD user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create or update user account',
        error: error.message
      });
    }

    // Generate JWT token
    let token = generateToken(user._id, user.role);
    token = String(token).replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
    const decoded = jwt.decode(token);
    console.log('[AZURE LOGIN] JWT payload:', decoded);

    res.json({
      success: true,
      message: 'Azure AD login successful',
      data: {
        user: user.toPublicJSON(),
        token,
        isAzureAdUser: true
      }
    });

  } catch (error) {
    console.error('Azure AD login error:', error);
    res.status(500).json({
      success: false,
      message: 'Azure AD login failed',
      error: error.message
    });
  }
};

// Validate Azure AD token and get user info
export const validateAzureAdToken = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // In a production environment, you would validate the token with Microsoft Graph API
    // For now, we'll assume the token is valid and extract user info from the request
    const userInfo = req.body.userInfo;

    if (!userInfo) {
      return res.status(400).json({
        success: false,
        message: 'User information is required'
      });
    }

    // Find or create user
    const azureAdData = {
      azureAdId: userInfo.localAccountId || userInfo.homeAccountId,
      email: userInfo.username || userInfo.name,
      displayName: userInfo.name || userInfo.username,
      tenantId: userInfo.tenantId
    };

    const user = await User.createOrUpdateAzureAdUser(azureAdData);
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Token validation successful',
      data: {
        user: user.toPublicJSON(),
        token,
        isAzureAdUser: true
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed',
      error: error.message
    });
  }
};

// Student login
export const studentLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { mobileNumber, studentId, password } = req.body;

    // Find student by mobile number or student ID
    let student = await User.findOne({
      $or: [
        { mobileNumber },
        { studentId }
      ],
      role: 'student',
      isActive: true,
      isAzureAdUser: false // Only traditional login users
    });

    // If student doesn't exist, create one (for demo purposes)
    if (!student) {
      const username = `student_${Date.now()}`;
      student = new User({
        username,
        password: password || 'default123', // In production, require proper password
        role: 'student',
        mobileNumber,
        studentId,
        studentName: `Student ${studentId}`,
        isAzureAdUser: false
      });
      await student.save();
    } else {
      // Verify password if student exists
      const isPasswordValid = await student.comparePassword(password || 'default123');
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Update last login
    student.lastLoginAt = new Date();
    await student.save();

    // Generate token
    const token = generateToken(student._id, student.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: student.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find admin user
    const admin = await User.findOne({
      username,
      role: 'admin',
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, admin.role);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: admin.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Register new admin (protected endpoint)
export const registerAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { username, password, email, adminName } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ username }, { email }],
      role: 'admin'
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username or email already exists'
      });
    }

    // Create new admin
    const admin = new User({
      username,
      password,
      role: 'admin',
      email,
      adminName
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        user: admin.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { studentName, adminName, email } = req.body;
    const updates = {};

    if (req.user.role === 'student' && studentName) {
      updates.studentName = studentName;
    }

    if (req.user.role === 'admin') {
      if (adminName) updates.adminName = adminName;
      if (email) updates.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Logout (client-side token removal)
export const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Initialize default admin (for first-time setup)
export const initializeDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const defaultAdmin = new User({
        username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        email: 'admin@financequiz.com',
        adminName: 'System Administrator'
      });

      await defaultAdmin.save();
      console.log('Default admin created successfully');
    }
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}; 