/**
 * Analysis Model
 * 
 * Stores ingredient analysis results with AI-generated insights,
 * reasoning chains, and user interactions for continuous learning.
 */

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Original image data
  imageData: {
    url: String, // If stored externally
    base64: String, // If stored inline (for demo purposes)
    format: String // 'jpeg', 'png', etc.
  },
  
  // OCR extracted text
  extractedText: {
    raw: String, // Raw OCR output
    cleaned: String, // Processed and cleaned text
    confidence: Number, // OCR confidence score (0-100)
    detectedLanguage: String
  },
  
  // Detected ingredients
  ingredients: [{
    name: String,
    category: String, // 'preservative', 'sweetener', 'flavoring', etc.
    confidence: Number,
    position: Number // Order in ingredient list
  }],
  
  // AI-generated insights
  insights: {
    // Overall product assessment
    summary: {
      verdict: {
        type: String,
        enum: ['healthy', 'moderate', 'concerning', 'avoid']
      },
      score: Number, // 0-100 health score
      oneLineSummary: String // Quick takeaway
    },
    
    // Detailed analysis
    healthImpact: {
      positives: [String], // Good aspects
      concerns: [String], // Issues to be aware of
      tradeoffs: [String] // Balanced considerations
    },
    
    // AI reasoning chain (transparent decision-making)
    reasoningSteps: [{
      step: Number,
      thought: String,
      evidence: [String],
      conclusion: String
    }],
    
    // Personalized insights based on user profile
    personalizedAdvice: {
      relevant: Boolean, // Is this relevant to user's goals?
      specificConcerns: [String], // User-specific warnings
      alternatives: [String], // Suggested alternatives
      whyRelevant: String // Explanation of personalization
    },
    
    // Contextual information
    context: {
      productType: String,
      intendedUse: String, // Inferred intent
      consumptionFrequency: String, // 'occasional', 'regular', 'frequent'
      riskLevel: String // 'low', 'medium', 'high'
    }
  },
  
  // Inferred user intent
  inferredIntent: {
    primaryGoal: String, // What user is trying to achieve
    confidence: Number, // How confident AI is about intent
    reasoning: String, // Why AI thinks this is the intent
    contextClues: [String] // What led to this inference
  },
  
  // Conversation thread (for follow-up questions)
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  
  // Metadata
  processingTime: Number, // Milliseconds
  model: String, // Gemini model version used
  promptVersion: String, // For A/B testing
  
  // User feedback
  userFeedback: {
    helpful: Boolean,
    rating: Number, // 1-5 stars
    comments: String,
    submittedAt: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for fast user history retrieval
analysisSchema.index({ userId: 1, createdAt: -1 });

// Index for searching by verdict
analysisSchema.index({ 'insights.summary.verdict': 1 });

// Virtual for checking if analysis is recent
analysisSchema.virtual('isRecent').get(function() {
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return hoursSinceCreation < 24;
});

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;