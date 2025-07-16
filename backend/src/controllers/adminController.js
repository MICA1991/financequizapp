import User from '../models/User.js';
import GameSession from '../models/GameSession.js';
import FinancialItem from '../models/FinancialItem.js';
import { validationResult } from 'express-validator';
import { seedDatabase } from '../utils/seeder.js';

// Get admin dashboard overview
export const getDashboardOverview = async (req, res) => {
  try {
    // Get total students
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });

    // Get total admins
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });

    // Get total game sessions
    const totalSessions = await GameSession.countDocuments({ status: 'completed' });

    // Get total questions
    const totalQuestions = await FinancialItem.countDocuments({ isActive: true });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await GameSession.countDocuments({
      status: 'completed',
      createdAt: { $gte: sevenDaysAgo }
    });

    const newStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get level-wise statistics
    const levelStats = await GameSession.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$level',
          totalSessions: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrectAnswers: { $sum: '$score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalAdmins,
          totalSessions,
          totalQuestions,
          recentSessions,
          newStudents
        },
        levelStats
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error.message
    });
  }
};

// Get all students with pagination
export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { role: 'student', isActive: true };

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      //.limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
};

// Get student details with performance
export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's game sessions
    const sessions = await GameSession.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get student's performance statistics
    const performance = await GameSession.aggregate([
      { $match: { studentId: student._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrectAnswers: { $sum: '$score' },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          averageTime: { $avg: '$timeTakenSeconds' },
          bestScore: { $max: '$score' },
          bestPercentage: { $max: '$percentage' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        student,
        sessions: sessions.map(session => session.getSummary()),
        performance: performance[0] || null
      }
    });

  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student details',
      error: error.message
    });
  }
};

// Get all game sessions with filters
export const getAllGameSessions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      level, 
      studentId, 
      startDate, 
      endDate,
      minScore,
      maxScore
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { status: 'completed' };

    if (level) query.level = parseInt(level);
    if (studentId) query.studentId = studentId;
    if (minScore) query.score = { $gte: parseInt(minScore) };
    if (maxScore) query.score = { ...query.score, $lte: parseInt(maxScore) };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sessions = await GameSession.find(query)
      .populate('studentId', 'studentName studentId mobileNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      //.limit(parseInt(limit));

    const total = await GameSession.countDocuments(query);

    res.json({
      success: true,
      data: sessions.map(session => ({
        ...session.getSummary(),
        student: session.studentId
      }))
    });

  } catch (error) {
    console.error('Get all game sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game sessions',
      error: error.message
    });
  }
};

// Get question statistics
export const getQuestionStats = async (req, res) => {
  try {
    const { level } = req.query;

    let query = { isActive: true };
    if (level) query.level = parseInt(level);

    const questions = await FinancialItem.find(query)
      .select('id name level usageCount correctAnswerRate')
      .sort({ usageCount: -1 });

    const totalQuestions = questions.length;
    const totalUsage = questions.reduce((sum, q) => sum + q.usageCount, 0);
    const averageCorrectRate = questions.length > 0 
      ? questions.reduce((sum, q) => sum + q.correctAnswerRate, 0) / questions.length 
      : 0;

    res.json({
      success: true,
      data: {
        questions,
        summary: {
          totalQuestions,
          totalUsage,
          averageCorrectRate: Math.round(averageCorrectRate)
        }
      }
    });

  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get question statistics',
      error: error.message
    });
  }
};

// Add new financial item
export const addFinancialItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      id,
      name,
      category,
      multiCategories,
      explanation,
      level,
      difficulty,
      tags
    } = req.body;

    // Check if item already exists
    const existingItem = await FinancialItem.findOne({ id });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Financial item with this ID already exists'
      });
    }

    const newItem = new FinancialItem({
      id,
      name,
      category,
      multiCategories,
      explanation,
      level,
      difficulty,
      tags: tags || []
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: 'Financial item added successfully',
      data: {
        item: newItem
      }
    });

  } catch (error) {
    console.error('Add financial item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add financial item',
      error: error.message
    });
  }
};

// Update financial item
export const updateFinancialItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;

    const item = await FinancialItem.findOneAndUpdate(
      { id: itemId },
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Financial item not found'
      });
    }

    res.json({
      success: true,
      message: 'Financial item updated successfully',
      data: {
        item
      }
    });

  } catch (error) {
    console.error('Update financial item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update financial item',
      error: error.message
    });
  }
};

// Delete financial item (soft delete)
export const deleteFinancialItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await FinancialItem.findOneAndUpdate(
      { id: itemId },
      { isActive: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Financial item not found'
      });
    }

    res.json({
      success: true,
      message: 'Financial item deleted successfully'
    });

  } catch (error) {
    console.error('Delete financial item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete financial item',
      error: error.message
    });
  }
};

// Export data for analytics
export const exportData = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let data;
    switch (type) {
      case 'sessions':
        data = await GameSession.find(query)
          .populate('studentId', 'studentName studentId mobileNumber')
          .sort({ createdAt: -1 });
        break;
      case 'students':
        data = await User.find({ role: 'student', ...query })
          .select('-password')
          .sort({ createdAt: -1 });
        break;
      case 'questions':
        data = await FinancialItem.find({ isActive: true, ...query })
          .sort({ level: 1, usageCount: -1 });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    res.json({
      success: true,
      data: {
        type,
        count: data.length,
        data
      }
    });

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

// Seed database with financial items
export const seedDatabaseController = async (req, res) => {
  try {
    console.log('🌱 Starting database seeding via API...');
    
    await seedDatabase();
    
    res.json({
      success: true,
      message: 'Database seeded successfully'
    });

  } catch (error) {
    console.error('Seed database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message
    });
  }
}; 

// Get detailed session report for admin
export const getAdminSessionReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSession.findById(sessionId).populate('studentId', 'studentName studentId mobileNumber');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        session: session.getSummary(),
        detailedAnswers: session.getDetailedAnswers(),
        student: session.studentId
      }
    });
  } catch (error) {
    console.error('Get admin session report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session report',
      error: error.message
    });
  }
}; 