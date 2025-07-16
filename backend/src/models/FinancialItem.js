import mongoose from 'mongoose';

const financialItemCategoryEntrySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'],
    required: true
  }
}, { _id: false });

const financialItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'],
    required: function() { return !this.multiCategories || this.multiCategories.length === 0; }
  },
  multiCategories: {
    type: [financialItemCategoryEntrySchema],
    required: function() { return !this.category; },
    default: undefined,
    validate: {
      validator: function(categories) {
        // If categories is undefined/null, it's valid (single category item)
        if (!categories) return true;
        // If categories is empty array, it's invalid
        if (categories.length === 0) return false;
        // Max 2 categories for Level 4
        if (categories.length > 2) return false;
        return true;
      },
      message: 'Multi-categories must have 1-2 categories'
    }
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    enum: [1, 2, 3, 4]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'pro', 'expert'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  correctAnswerRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
financialItemSchema.index({ level: 1, isActive: 1 });
financialItemSchema.index({ category: 1 });
financialItemSchema.index({ difficulty: 1 });
financialItemSchema.index({ tags: 1 });
financialItemSchema.index({ usageCount: -1 });

// Virtual for determining if item is multi-category
financialItemSchema.virtual('isMultiCategory').get(function() {
  return this.multiCategories && this.multiCategories.length > 0;
});

// Method to get correct categories
financialItemSchema.methods.getCorrectCategories = function() {
  if (this.multiCategories && this.multiCategories.length > 0) {
    return this.multiCategories.map(mc => mc.category);
  }
  return this.category ? [this.category] : [];
};

// Method to check if answer is correct
financialItemSchema.methods.isCorrectAnswer = function(selectedCategories) {
  const correctCategories = this.getCorrectCategories();
  
  if (!selectedCategories || selectedCategories.length === 0) {
    return false;
  }
  
  if (selectedCategories.length !== correctCategories.length) {
    return false;
  }
  
  return selectedCategories.every(cat => correctCategories.includes(cat)) &&
         correctCategories.every(cat => selectedCategories.includes(cat));
};

// Method to update usage statistics
financialItemSchema.methods.updateStats = function(isCorrect) {
  this.usageCount += 1;
  
  // Update correct answer rate
  const currentCorrect = Math.round((this.correctAnswerRate * (this.usageCount - 1)) / 100);
  const newCorrect = isCorrect ? currentCorrect + 1 : currentCorrect;
  this.correctAnswerRate = Math.round((newCorrect / this.usageCount) * 100);
  
  return this.save();
};

// Static method to get items by level
financialItemSchema.statics.getByLevel = function(level, limit = 10) {
  return this.find({ 
    level, 
    isActive: true 
  })
  .sort({ usageCount: 1 }) // Prefer less used items
  .limit(limit);
};

// Static method to get random items by level
financialItemSchema.statics.getRandomByLevel = function(level, count = 10) {
  return this.aggregate([
    { $match: { level, isActive: true } },
    { $sample: { size: count } }
  ]);
};

const FinancialItem = mongoose.model('FinancialItem', financialItemSchema);

export default FinancialItem; 