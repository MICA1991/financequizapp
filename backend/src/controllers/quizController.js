import FinancialItem from '../models/FinancialItem.js';
import GameSession from '../models/GameSession.js';
import { validationResult } from 'express-validator';

// Get questions for a specific level
export const getQuestionsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { count = 10 } = req.query;

    const levelNum = parseInt(level);
    if (levelNum < 1 || levelNum > 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be between 1 and 4'
      });
    }

    // Get random questions for the level
    const questions = await FinancialItem.getRandomByLevel(levelNum, parseInt(count));

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this level'
      });
    }

    // Format questions for frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      name: q.name,
      category: q.category,
      multiCategories: q.multiCategories,
      explanation: q.explanation,
      level: q.level
    }));

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        totalQuestions: formattedQuestions.length,
        level: levelNum
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: error.message
    });
  }
};

// Start a new game session
export const startGameSession = async (req, res) => {
  try {
    const { level } = req.body;
    const studentId = req.user._id;
    const studentIdentifier = req.user.mobileNumber || req.user.studentId;

    console.log('[START SESSION] Called by user:', req.user._id, 'role:', req.user.role, 'payload:', req.body);

    const levelNum = parseInt(level);
    if (levelNum < 1 || levelNum > 4) {
      console.warn('[START SESSION] Invalid level:', levelNum);
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be between 1 and 4'
      });
    }

    // Get questions for the level
    const questions = await FinancialItem.getRandomByLevel(levelNum, 10);

    if (questions.length === 0) {
      console.warn('[START SESSION] No questions available for level:', levelNum);
      return res.status(404).json({
        success: false,
        message: 'No questions available for this level'
      });
    }

    // Create game session
    const gameSession = new GameSession({
      studentId,
      studentIdentifier: req.user.mobileNumber || req.user.studentId || req.user.azureAdEmail || req.user.username, // fallback for Azure AD
      level: levelNum,
      score: 0,
      totalQuestions: questions.length,
      percentage: 0, // <-- Add this
      answers: [],   // <-- Now allowed to be empty
      startTime: new Date(),
      endTime: null, // <-- Now allowed to be null
      timeTakenSeconds: 0,
      status: 'in_progress'
    });

    await gameSession.save();
    console.log('[START SESSION] New session created:', gameSession._id, 'studentId:', studentId, 'level:', levelNum);

    res.json({
      success: true,
      message: 'Game session started',
      data: {
        sessionId: gameSession._id,
        questions: questions.map(q => ({
          id: q.id,
          name: q.name,
          category: q.category,
          multiCategories: q.multiCategories,
          explanation: q.explanation,
          level: q.level
        })),
        level: levelNum,
        totalQuestions: questions.length
      }
    });

  } catch (error) {
    console.error('Start game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start game session',
      error: error.message
    });
  }
};

// Submit an answer
export const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, selectedCategories, timeSpent } = req.body;
    const studentId = req.user._id;

    // Find the game session
    const gameSession = await GameSession.findOne({
      _id: sessionId,
      studentId,
      status: 'in_progress'
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found or already completed'
      });
    }

    // Find the question
    const question = await FinancialItem.findOne({ id: questionId });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer is correct
    const isCorrect = question.isCorrectAnswer(selectedCategories);
    const correctCategories = question.getCorrectCategories();

    // Update question statistics
    await question.updateStats(isCorrect);

    // Add answer to session
    const answer = {
      questionId,
      questionText: question.name,
      selectedCategories,
      correctCategories,
      isCorrect,
      timeSpent: timeSpent || 0
    };

    gameSession.answers.push(answer);

    // Update score if correct
    if (isCorrect) {
      gameSession.score += 1;
    }

    await gameSession.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        correctCategories,
        explanation: question.explanation,
        currentScore: gameSession.score,
        totalQuestions: gameSession.totalQuestions
      }
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
};

// Complete game session
export const completeGameSession = async (req, res) => {
  try {
    const { sessionId, feedbackText } = req.body;
    const studentId = req.user._id;

    console.log('[COMPLETE SESSION] Called for sessionId:', sessionId, 'studentId:', studentId, 'role:', req.user.role, 'payload:', req.body);

    // Find the game session (in_progress or completed for idempotency)
    const query = {
      _id: sessionId,
      studentId
    };
    let gameSession = await GameSession.findOne({ ...query, status: 'in_progress' });
    if (!gameSession) {
      // Try to find already completed session for idempotency
      gameSession = await GameSession.findOne({ ...query, status: 'completed' });
      if (gameSession) {
        console.log('[COMPLETE SESSION] Session already completed:', sessionId);
        return res.json({
          success: true,
          message: 'Game session already completed',
          data: { session: gameSession.getSummary() }
        });
      }
      console.log('[COMPLETE SESSION] Not found or not in progress:', sessionId, 'Query:', query);
      return res.status(404).json({
        success: false,
        message: 'Game session not found or already completed'
      });
    }

    console.log('[COMPLETE SESSION] Before update:', gameSession);

    // Update session
    gameSession.endTime = new Date();
    gameSession.timeTakenSeconds = Math.round(
      (gameSession.endTime - gameSession.startTime) / 1000
    );
    gameSession.feedbackText = feedbackText;
    gameSession.status = 'completed';

    await gameSession.save();
    console.log('[COMPLETE SESSION] After update and save:', gameSession);

    res.json({
      success: true,
      message: 'Game session completed',
      data: {
        session: gameSession.getSummary()
      }
    });

  } catch (error) {
    console.error('Complete game session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete game session',
      error: error.message
    });
  }
};

// Get student's game history
export const getGameHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await GameSession.find({
      studentId,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await GameSession.countDocuments({
      studentId,
      status: 'completed'
    });

    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => session.getSummary()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game history',
      error: error.message
    });
  }
};

// Get detailed session report
export const getSessionReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user._id;

    const session = await GameSession.findOne({
      _id: sessionId,
      studentId
    });

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
        detailedAnswers: session.getDetailedAnswers()
      
      }
    });

  } catch (error) {
    console.error('Get session report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session report',
      error: error.message
    });
  }
};

// Get student performance statistics
export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get overall stats
    const overallStats = await GameSession.aggregate([
      { $match: { studentId, status: 'completed' } },
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

    // Get stats by level
    const levelStats = await GameSession.aggregate([
      { $match: { studentId, status: 'completed' } },
      {
        $group: {
          _id: '$level',
          sessions: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          bestScore: { $max: '$score' },
          bestPercentage: { $max: '$percentage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats[0] || null,
        byLevel: levelStats
      }
    });

  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student statistics',
      error: error.message
    });
  }
}; 