import express from 'express';
import { body } from 'express-validator';
import {
  studentLogin,
  adminLogin,
  registerAdmin,
  getProfile,
  updateProfile,
  logout,
  azureAdLogin,
  validateAzureAdToken
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const studentLoginValidation = [
  body('mobileNumber')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10 and 15 characters'),
  body('studentId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const adminLoginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const adminRegistrationValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('adminName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin name must be between 2 and 50 characters')
];

const profileUpdateValidation = [
  body('studentName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Student name must be between 2 and 50 characters'),
  body('adminName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Azure AD validation
const azureAdLoginValidation = [
  body('accessToken')
    .notEmpty()
    .withMessage('Access token is required'),
  body('account')
    .isObject()
    .withMessage('Account information is required')
];

// Public routes
router.post('/student/login', studentLoginValidation, studentLogin);
router.post('/admin/login', adminLoginValidation, adminLogin);
router.post('/azure/login', azureAdLoginValidation, azureAdLogin);
router.post('/azure/validate', azureAdLoginValidation, validateAzureAdToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, profileUpdateValidation, updateProfile);
router.post('/logout', authenticateToken, logout);

// Admin-only routes
router.post('/admin/register', authenticateToken, requireAdmin, adminRegistrationValidation, registerAdmin);

export default router; 