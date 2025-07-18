import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import 'express-async-errors';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import adminRoutes from './routes/admin.js';
import { initializeDefaultAdmin } from './controllers/authController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to database
connectDB();

// Initialize default admin
initializeDefaultAdmin();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Quiz API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Quiz API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/student/login': 'Student login',
        'POST /api/auth/admin/login': 'Admin login',
        'GET /api/auth/profile': 'Get user profile (protected)',
        'PUT /api/auth/profile': 'Update user profile (protected)',
        'POST /api/auth/logout': 'Logout (protected)',
        'POST /api/auth/admin/register': 'Register new admin (admin only)'
      },
      quiz: {
        'GET /api/quiz/questions/:level': 'Get questions by level',
        'POST /api/quiz/session/start': 'Start game session (student)',
        'POST /api/quiz/session/answer': 'Submit answer (student)',
        'POST /api/quiz/session/complete': 'Complete game session (student)',
        'GET /api/quiz/history': 'Get game history (student)',
        'GET /api/quiz/session/:sessionId/report': 'Get session report (student)',
        'GET /api/quiz/stats': 'Get student stats (student)'
      },
      admin: {
        'GET /api/admin/dashboard/overview': 'Get dashboard overview (admin)',
        'GET /api/admin/students': 'Get all students (admin)',
        'GET /api/admin/students/:studentId': 'Get student details (admin)',
        'GET /api/admin/sessions': 'Get all game sessions (admin)',
        'GET /api/admin/questions/stats': 'Get question statistics (admin)',
        'POST /api/admin/questions': 'Add new question (admin)',
        'PUT /api/admin/questions/:itemId': 'Update question (admin)',
        'DELETE /api/admin/questions/:itemId': 'Delete question (admin)',
        'GET /api/admin/export': 'Export data (admin)'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Finance Quiz API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);
});

export default app; 
