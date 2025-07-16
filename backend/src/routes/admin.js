import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardOverview,
  getAllStudents,
  getStudentDetails,
  getAllGameSessions,
  getQuestionStats,
  addFinancialItem,
  updateFinancialItem,
  deleteFinancialItem,
  exportData,
  seedDatabaseController,
  getAdminSessionReport
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Validation middleware
const financialItemValidation = [
  body('id')
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('Item ID must be between 1 and 20 characters')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Item ID can only contain uppercase letters, numbers, and underscores'),
  body('name')
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Item name must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'])
    .withMessage('Invalid category'),
  body('multiCategories')
    .optional()
    .isArray({ min: 1, max: 2 })
    .withMessage('Multi-categories must be an array with 1-2 items'),
  body('multiCategories.*.category')
    .isIn(['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'])
    .withMessage('Invalid category in multi-categories'),
  body('explanation')
    .isString()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Explanation must be between 20 and 1000 characters'),
  body('level')
    .isInt({ min: 1, max: 4 })
    .withMessage('Level must be between 1 and 4'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'pro', 'expert'])
    .withMessage('Invalid difficulty level'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateFinancialItemValidation = [
  body('name')
    .optional()
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Item name must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'])
    .withMessage('Invalid category'),
  body('multiCategories')
    .optional()
    .isArray({ min: 1, max: 2 })
    .withMessage('Multi-categories must be an array with 1-2 items'),
  body('multiCategories.*.category')
    .isIn(['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'])
    .withMessage('Invalid category in multi-categories'),
  body('explanation')
    .optional()
    .isString()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Explanation must be between 20 and 1000 characters'),
  body('level')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Level must be between 1 and 4'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'pro', 'expert'])
    .withMessage('Invalid difficulty level'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Dashboard routes
router.get('/dashboard/overview', getDashboardOverview);

// Student management routes
router.get('/students', getAllStudents);
router.get('/students/:studentId', getStudentDetails);

// Game session management routes
router.get('/sessions', getAllGameSessions);
router.get('/session/:sessionId', requireAdmin, getAdminSessionReport);

// Question management routes
router.get('/questions/stats', getQuestionStats);
router.post('/questions', financialItemValidation, addFinancialItem);
router.put('/questions/:itemId', updateFinancialItemValidation, updateFinancialItem);
router.delete('/questions/:itemId', deleteFinancialItem);

// Data export routes
router.get('/export', exportData);

// Database management routes
router.post('/seed', seedDatabaseController);

export default router; 