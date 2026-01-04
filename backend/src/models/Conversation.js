/**
 * Conversation Model
 * 
 * Manages multi-turn AI conversations for follow-up questions
 * and deeper ingredient understanding.
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Related analysis
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true
  },
  
  // Conversation messages
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    // For assistant messages: reasoning shown to user
    reasoning: {
      visible: Boolean, // Should reasoning be shown?
      steps: [String], // Reasoning chain
      confidence: Number // AI confidence in response
    },
    // Message metadata
    metadata: {
      model: String,
      tokensUsed: Number,
      processingTime: Number
    }
  }],
  
  // Conversation context maintained across messages
  context: {
    productName: String,
    mainConcerns: [String], // Extracted from conversation
    userIntent: String, // Current conversation goal
    keyIngredients: [String] // Ingredients discussed
  },
  
  // Conversation state
  status: {
    type: String,
    enum: ['active', 'resolved', 'abandoned'],
    default: 'active'
  },
  
  // Summary of conversation (generated at end)
  summary: {
    keyPoints: [String],
    decisionsHelped: [String],
    satisfactionIndicators: {
      questionsAnswered: Number,
      clarityAchieved: Boolean,
      userEngagement: String // 'high', 'medium', 'low'
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastMessageAt on new messages
conversationSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

// Index for recent conversations
conversationSchema.index({ userId: 1, lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;