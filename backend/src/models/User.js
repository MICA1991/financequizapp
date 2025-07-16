import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Common fields
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.azureAdId; }, // Only required if not Azure AD user
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Azure AD specific fields
  azureAdId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  azureAdEmail: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  azureAdDisplayName: {
    type: String,
    trim: true
  },
  azureAdTenantId: {
    type: String,
    trim: true
  },
  isAzureAdUser: {
    type: Boolean,
    default: false
  },
  
  // Student-specific fields
  mobileNumber: {
    type: String,
    required: function() { return this.role === 'student' && !this.isAzureAdUser; },
    unique: true,
    sparse: true,
    trim: true
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student' && !this.isAzureAdUser; },
    unique: true,
    sparse: true,
    trim: true
  },
  studentName: {
    type: String,
    trim: true
  },
  
  // Admin-specific fields
  email: {
    type: String,
    required: function() { return this.role === 'admin' && !this.isAzureAdUser; },
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  adminName: {
    type: String,
    trim: true
  },
  
  // Timestamps
  lastLoginAt: {
    type: Date
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
userSchema.index({ username: 1 });
userSchema.index({ mobileNumber: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ azureAdId: 1 });
userSchema.index({ azureAdEmail: 1 });

// Pre-save middleware to hash password (only for non-Azure AD users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isAzureAdUser) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password (only for non-Azure AD users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isAzureAdUser) {
    throw new Error('Password comparison not available for Azure AD users');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find by Azure AD ID
userSchema.statics.findByAzureAdId = async function(azureAdId) {
  return this.findOne({ azureAdId, isActive: true });
};

// Static method to find by Azure AD email
userSchema.statics.findByAzureAdEmail = async function(email) {
  return this.findOne({ azureAdEmail: email.toLowerCase(), isActive: true });
};

// Static method to find by credentials (for traditional login)
userSchema.statics.findByCredentials = async function(username, password) {
  const user = await this.findOne({ username, isActive: true, isAzureAdUser: false });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  return user;
};

// Method to create or update Azure AD user
userSchema.statics.createOrUpdateAzureAdUser = async function(azureAdData) {
  const { 
    azureAdId, 
    email, 
    displayName, 
    tenantId 
  } = azureAdData;

  // Try to find existing user by Azure AD ID
  let user = await this.findOne({ azureAdId, isActive: true });
  
  if (!user) {
    // Try to find by email
    user = await this.findOne({ azureAdEmail: email.toLowerCase(), isActive: true });
    
    if (user) {
      // Update existing user with Azure AD info
      user.azureAdId = azureAdId;
      user.azureAdEmail = email.toLowerCase();
      user.azureAdDisplayName = displayName;
      user.azureAdTenantId = tenantId;
      user.isAzureAdUser = true;
      user.studentName = displayName; // Use Azure AD display name
      // Force role to student for Azure AD users
      user.role = 'student';
    } else {
      // Create new Azure AD user
      const username = `azure_${azureAdId}`;
      user = new this({
        username,
        role: 'student', // Always student for Azure AD
        azureAdId,
        azureAdEmail: email.toLowerCase(),
        azureAdDisplayName: displayName,
        azureAdTenantId: tenantId,
        isAzureAdUser: true,
        studentName: displayName,
        isActive: true
      });
    }
  } else {
    // Update existing Azure AD user info
    user.azureAdEmail = email.toLowerCase();
    user.azureAdDisplayName = displayName;
    user.azureAdTenantId = tenantId;
    user.studentName = displayName;
    // Force role to student for Azure AD users
    user.role = 'student';
  }

  user.lastLoginAt = new Date();
  await user.save();
  
  return user;
};

const User = mongoose.model('User', userSchema);

export default User; 