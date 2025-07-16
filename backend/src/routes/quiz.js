import express from 'express';
import { body } from 'express-validator';
import {
  getQuestionsByLevel,
  startGameSession,
  submitAnswer,
  completeGameSession,
  getGameHistory,
  getSessionReport,
  getStudentStats
} from '../controllers/quizController.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const startGameValidation = [
  body('level')
    .isInt({ min: 1, max: 4 })
    .withMessage('Level must be between 1 and 4')
];

const submitAnswerValidation = [
  body('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('questionId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Question ID is required'),
  body('selectedCategories')
    .isArray({ min: 1, max: 2 })
    .withMessage('Selected categories must be an array with 1-2 items'),
  body('selectedCategories.*')
    .isIn(['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'])
    .withMessage('Invalid category selected'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer')
];

const completeSessionValidation = [
  body('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('feedbackText')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Feedback text must be less than 1000 characters')
];

// Public routes (can be accessed without authentication for demo)
router.get('/questions/:level', getQuestionsByLevel);

// Protected routes (require student authentication)
router.post('/session/start', authenticateToken, requireStudent, startGameValidation, startGameSession);
router.post('/session/answer', authenticateToken, requireStudent, submitAnswerValidation, submitAnswer);
router.post('/session/complete', authenticateToken, requireStudent, completeSessionValidation, completeGameSession);
router.get('/history', authenticateToken, requireStudent, getGameHistory);
router.get('/session/:sessionId/report', authenticateToken, requireStudent, getSessionReport);
router.get('/stats', authenticateToken, requireStudent, getStudentStats);

export default router; 