import mongoose from 'mongoose';

// Activity sub-schema
const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  date: {
    type: Date,
    required: true
  },
  
  time: {
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Time must be in HH:MM format'
      }
    },
    
    endTime: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    },
    
    duration: {
      type: Number, // in minutes
      required: false,
      min: 0
    }
  },
  
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    address: {
      type: String,
      trim: true
    },
    
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  cost: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: 3
    },
    
    category: {
      type: String,
      enum: ['transportation', 'accommodation', 'food', 'entertainment', 'shopping', 'other'],
      default: 'other'
    }
  },
  
  // AI-generated content
  aiGenerated: {
    type: Boolean,
    default: true
  },
  
  // User customizations
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Day itinerary sub-schema
const dayItinerarySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
    min: 1
  },
  
  date: {
    type: Date,
    required: true
  },
  
  theme: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  activities: [activitySchema],
  
  summary: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  totalCost: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, {
  timestamps: true
});

// Hotel sub-schema
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    perNight: {
      type: Boolean,
      default: true
    }
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  imageUrl: {
    type: String,
    trim: true
  },
  
  amenities: [{
    type: String,
    trim: true
  }],
  
  bookingReference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Main Trip schema
const tripSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // was true, now optional for unauthenticated trips
    index: true
  },
  
  // Basic trip information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  destination: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    country: {
      type: String,
      required: true,
      trim: true
    },
    
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Trip details
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  numberOfDays: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  
  budget: {
    type: String,
    enum: ['Cheap', 'Moderate', 'Luxury'],
    required: true
  },
  
  travelGroup: {
    type: String,
    enum: ['Just Me', 'A Couple', 'Family', 'Friends'],
    required: true
  },
  
  // AI-generated content
  aiGenerated: {
    type: Boolean,
    default: true
  },
  
  // Itinerary and activities
  itinerary: [dayItinerarySchema],
  
  // Accommodation
  hotels: [hotelSchema],
  
  // Budget tracking
  budgetBreakdown: {
    totalBudget: {
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    
    categories: {
      transportation: {
        type: Number,
        default: 0
      },
      accommodation: {
        type: Number,
        default: 0
      },
      food: {
        type: Number,
        default: 0
      },
      entertainment: {
        type: Number,
        default: 0
      },
      shopping: {
        type: Number,
        default: 0
      },
      other: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Trip status
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  
  // Additional information
  bestTimeToVisit: {
    type: String,
    trim: true
  },
  
  weatherInfo: {
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['Celsius', 'Fahrenheit'],
        default: 'Celsius'
      }
    },
    conditions: {
      type: String,
      trim: true
    }
  },
  
  // User notes and customization
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Sharing and collaboration
  isPublic: {
    type: Boolean,
    default: false
  },
  
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // AI generation metadata
  aiMetadata: {
    model: {
      type: String,
      trim: true
    },
    
    prompt: {
      type: String,
      trim: true
    },
    
    generatedAt: {
      type: Date,
      default: Date.now
    },
    
    version: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return this.numberOfDays;
});

// Virtual for total cost
tripSchema.virtual('totalCost').get(function() {
  if (this.budgetBreakdown?.totalBudget?.amount) {
    return this.budgetBreakdown.totalBudget;
  }
  
  let total = 0;
  if (this.budgetBreakdown?.categories) {
    Object.values(this.budgetBreakdown.categories).forEach(amount => {
      total += amount || 0;
    });
  }
  
  return {
    amount: total,
    currency: this.budgetBreakdown?.totalBudget?.currency || 'USD'
  };
});

// Virtual for progress percentage
tripSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  
  const totalActivities = this.itinerary.reduce((sum, day) => sum + day.activities.length, 0);
  if (totalActivities === 0) return 0;
  
  const completedActivities = this.itinerary.reduce((sum, day) => {
    return sum + day.activities.filter(activity => activity.isCompleted).length;
  }, 0);
  
  return Math.round((completedActivities / totalActivities) * 100);
});

// Indexes for performance
tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ userId: 1, startDate: 1 });
tripSchema.index({ destination: 'text', title: 'text' });
tripSchema.index({ status: 1, startDate: 1 });
tripSchema.index({ 'destination.country': 1 });

// Pre-save middleware
tripSchema.pre('save', function(next) {
  // Ensure endDate is after startDate
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Calculate numberOfDays if dates are provided
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  next();
});

// Static method to find trips by user
tripSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) query.status = options.status;
  if (options.destination) query['destination.name'] = new RegExp(options.destination, 'i');
  
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .populate('userId', 'firstName lastName email')
    .limit(options.limit || 50);
};

// Instance method to calculate budget
tripSchema.methods.calculateBudget = function() {
  let total = 0;
  const categories = {};
  
  // Calculate from activities
  this.itinerary.forEach(day => {
    day.activities.forEach(activity => {
      const amount = activity.cost.amount || 0;
      const category = activity.cost.category;
      
      total += amount;
      categories[category] = (categories[category] || 0) + amount;
    });
  });
  
  // Calculate from hotels
  this.hotels.forEach(hotel => {
    const amount = hotel.price.amount || 0;
    total += amount;
    categories.accommodation = (categories.accommodation || 0) + amount;
  });
  
  this.budgetBreakdown = {
    totalBudget: {
      amount: total,
      currency: 'USD'
    },
    categories: {
      transportation: categories.transportation || 0,
      accommodation: categories.accommodation || 0,
      food: categories.food || 0,
      entertainment: categories.entertainment || 0,
      shopping: categories.shopping || 0,
      other: categories.other || 0
    }
  };
  
  return this.budgetBreakdown;
};

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
export default Trip;
