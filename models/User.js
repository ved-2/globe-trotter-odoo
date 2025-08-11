import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Clerk authentication ID
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User profile information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  profileImage: {
    type: String,
    default: null
  },
  
  // User preferences
  preferences: {
    defaultBudget: {
      type: String,
      enum: ['Cheap', 'Moderate', 'Luxury'],
      default: 'Moderate'
    },
    
    defaultTravelGroup: {
      type: String,
      enum: ['Just Me', 'A Couple', 'Family', 'Friends'],
      default: 'Just Me'
    },
    
    favoriteDestinations: [{
      type: String,
      trim: true
    }],
    
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Subscription info
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for trip count
userSchema.virtual('tripCount', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'userId',
  count: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ clerkId: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
