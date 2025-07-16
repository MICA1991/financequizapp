import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  selectedCategories: [{
    type: String,
    enum: ['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY']
  }],
  correctCategories: [{
    type: String,
    enum: ['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY']
  }],
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentIdentifier: {
    type: String, // mobile number or student ID for easy reference
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    enum: [1, 2, 3, 4]
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  answers: {
    type: [answerSchema],
    required: true,
    default: []
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: false, // allow null for in-progress
    default: null
  },
  timeTakenSeconds: {
    type: Number,
    required: true,
    min: 0
  },
  feedbackText: {
    type: String,
    trim: true
  },
  performance: {
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    averageTimePerQuestion: {
      type: Number,
      min: 0
    },
    fastestAnswer: {
      type: Number,
      min: 0
    },
    slowestAnswer: {
      type: Number,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
gameSessionSchema.index({ studentId: 1, createdAt: -1 });
gameSessionSchema.index({ level: 1, createdAt: -1 });
gameSessionSchema.index({ score: -1 });
gameSessionSchema.index({ status: 1 });
gameSessionSchema.index({ studentIdentifier: 1 });

// Pre-save middleware to calculate percentage and performance metrics
gameSessionSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isModified('totalQuestions')) {
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  }
  
  if (this.isModified('answers') && this.answers.length > 0) {
    // Calculate performance metrics
    const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
    this.performance.accuracy = Math.round((correctAnswers / this.answers.length) * 100);
    
    const times = this.answers.map(answer => answer.timeSpent).filter(time => time > 0);
    if (times.length > 0) {
      this.performance.averageTimePerQuestion = Math.round(
        times.reduce((sum, time) => sum + time, 0) / times.length
      );
      this.performance.fastestAnswer = Math.min(...times);
      this.performance.slowestAnswer = Math.max(...times);
    }
  }
  
  next();
});

// Method to get session summary
gameSessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    studentIdentifier: this.studentIdentifier,
    level: this.level,
    score: this.score,
    totalQuestions: this.totalQuestions,
    percentage: this.percentage,
    timeTakenSeconds: this.timeTakenSeconds,
    performance: this.performance,
    startTime: this.startTime,
    endTime: this.endTime,
    hasFeedback: !!this.feedbackText
  };
};

// Method to get detailed answers
gameSessionSchema.methods.getDetailedAnswers = function() {
  return this.answers.map(answer => ({
    questionId: answer.questionId,
    questionText: answer.questionText,
    selectedCategories: answer.selectedCategories,
    correctCategories: answer.correctCategories,
    isCorrect: answer.isCorrect,
    timeSpent: answer.timeSpent
  }));
};

// Static method to get student performance
gameSessionSchema.statics.getStudentPerformance = async function(studentId, limit = 10) {
  return this.find({ studentId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get level statistics
gameSessionSchema.statics.getLevelStats = async function(level) {
  const stats = await this.aggregate([
    { $match: { level, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: '$percentage' },
        averageTime: { $avg: '$timeTakenSeconds' },
        totalQuestions: { $sum: '$totalQuestions' },
        totalCorrectAnswers: { $sum: '$score' }
      }
    }
  ]);
  
  return stats[0] || null;
};

// Static method to get top performers
gameSessionSchema.statics.getTopPerformers = async function(level, limit = 10) {
  return this.find({ level, status: 'completed' })
    .sort({ percentage: -1, timeTakenSeconds: 1 })
    .limit(limit)
    .populate('studentId', 'studentName studentId mobileNumber');
};

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession; 