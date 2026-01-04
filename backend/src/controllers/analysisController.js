/**
 * Analysis Controller
 * * Orchestrates the analysis pipeline:
 * 1. Receives Base64 image from Frontend
 * 2. Performs OCR (Optical Character Recognition) to get raw text
 * 3. Sends text + context to Gemini AI for reasoning
 * 4. Saves results to MongoDB
 */

const Analysis = require('../models/Analysis');
const User = require('../models/User'); // Required for user context
const geminiService = require('../services/geminiService');
const Tesseract = require('tesseract.js');

class AnalysisController {
  
  constructor() {
    // ✅ FIX: Bind 'this' to preserve access to private helper methods
    this.analyzeImage = this.analyzeImage.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getAnalysis = this.getAnalysis.bind(this);
    this.submitFeedback = this.submitFeedback.bind(this);
  }

  /**
   * Analyze ingredient image
   * POST /api/v1/analysis/image
   */
  async analyzeImage(req, res, next) {
    try {
      const { imageData } = req.body; // Expecting Base64 string
      const userId = req.user.id; // From auth middleware
      
      // 1. Validation
      if (!imageData) {
        return res.status(400).json({
          success: false,
          message: 'Image data is required'
        });
      }
      
      // 2. OCR Extraction (Tesseract.js)
      console.log(`[Analysis] Starting OCR for user ${userId}...`);
      const ocrStart = Date.now();
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        imageData,
        'eng',
        { 
          // Minimal logging to avoid cluttering server logs
          logger: m => m.status === 'recognizing text' ? null : null 
        }
      );
      
      const ocrTime = Date.now() - ocrStart;
      console.log(`[Analysis] OCR Complete (${ocrTime}ms). Confidence: ${confidence}%`);
      
      // 3. Text Pre-processing
      // ✅ FIX: Now 'this' refers to the class, so this works
      const cleanedText = this._cleanExtractedText(text);
      
      // Fail fast if image was too blurry or had no text
      if (!cleanedText || cleanedText.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract readable text. Please ensure the image is clear and focused on the ingredient list.'
        });
      }
      
      // 4. Gather User Context (for Personalization)
      const userContext = await this._getUserContext(userId);
      
      // 5. AI Inference Pipeline (Gemini)
      const aiStart = Date.now();
      
      // A. Infer Intent (What is the user looking for?)
      const intent = await geminiService.inferIntent(
        `Analyzing ingredient list: ${cleanedText.substring(0, 150)}...`,
        userContext
      );
      
      // B. Analyze Ingredients (The core logic)
      const analysisResult = await geminiService.analyzeIngredients(
        cleanedText,
        { ...userContext, intent } // Pass intent to help Gemini focus
      );
      
      const aiTime = Date.now() - aiStart;
      
      // 6. Save to Database
      const savedAnalysis = await Analysis.create({
        userId,
        extractedText: {
          raw: text,
          cleaned: cleanedText,
          confidence: confidence,
          detectedLanguage: 'en'
        },
        ingredients: analysisResult.ingredients || [],
        insights: {
          summary: analysisResult.summary,
          healthImpact: analysisResult.healthImpact,
          reasoningSteps: analysisResult.reasoningSteps,
          personalizedAdvice: analysisResult.personalizedAdvice,
          context: {
            productType: this._inferProductType(cleanedText),
            intendedUse: intent.primaryGoal,
            consumptionFrequency: 'occasional',
            riskLevel: this._calculateRiskLevel(analysisResult)
          }
        },
        inferredIntent: intent,
        processingTime: {
          ocr: ocrTime,
          ai: aiTime,
          total: ocrTime + aiTime
        },
        model: 'gemini-pro',
        createdAt: new Date()
      });
      
      // 7. Background Task: Update User Behavior Profile
      this._updateUserBehavior(userId, savedAnalysis).catch(err => 
        console.error('Failed to update user behavior:', err)
      );
      
      // 8. Send Response
      return res.status(200).json({
        success: true,
        message: 'Analysis completed successfully',
        data: {
          analysisId: savedAnalysis._id,
          extractedText: cleanedText,
          ocrConfidence: confidence,
          insights: savedAnalysis.insights,
          inferredIntent: intent,
          processingTime: savedAnalysis.processingTime
        }
      });
      
    } catch (error) {
      console.error('❌ [AnalysisController] Error:', error);
      next(error); 
    }
  }
  
  /**
   * Get user's analysis history
   * GET /api/v1/analysis/history
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const analyses = await Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('insights.summary extractedText.cleaned createdAt processingTime'); 
      
      const total = await Analysis.countDocuments({ userId });
      
      return res.status(200).json({
        success: true,
        data: {
          analyses,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get single analysis by ID
   * GET /api/v1/analysis/:id
   */
  async getAnalysis(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const analysis = await Analysis.findOne({ _id: id, userId });
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: analysis
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Submit feedback for analysis
   * POST /api/v1/analysis/:id/feedback
   */
  async submitFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { helpful, rating, comments } = req.body;
      const userId = req.user.id;
      
      const analysis = await Analysis.findOneAndUpdate(
        { _id: id, userId },
        {
          userFeedback: {
            helpful,
            rating,
            comments,
            submittedAt: new Date()
          }
        },
        { new: true }
      );
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: analysis.userFeedback
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  // --- Private Helpers ---

  _cleanExtractedText(text) {
    if (!text) return '';
    return text
      .replace(/[^\w\s,.:()%-]/g, ' ') 
      .replace(/\s+/g, ' ') 
      .trim();
  }
  
  async _getUserContext(userId) {
    const user = await User.findById(userId);
    
    if (!user) return {};
    
    return {
      preferences: user.preferences || {},
      behaviorProfile: user.behaviorProfile || {}
    };
  }
  
  _inferProductType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('cereal') || lowerText.includes('oats') || lowerText.includes('wheat')) return 'breakfast';
    if (lowerText.includes('chip') || lowerText.includes('crisp') || lowerText.includes('snack')) return 'snack';
    if (lowerText.includes('sauce') || lowerText.includes('dressing') || lowerText.includes('marinade')) return 'condiment';
    if (lowerText.includes('water') || lowerText.includes('drink') || lowerText.includes('beverage') || lowerText.includes('juice')) return 'beverage';
    if (lowerText.includes('milk') || lowerText.includes('yogurt') || lowerText.includes('cheese')) return 'dairy';
    
    return 'general';
  }
  
  _calculateRiskLevel(analysis) {
    if (!analysis.summary) return 'low';
    
    if (analysis.summary.verdict === 'avoid') return 'high';
    if (analysis.summary.verdict === 'concerning') return 'medium';
    
    const score = analysis.summary.score || 50;
    
    if (score >= 80) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  }
  
  async _updateUserBehavior(userId, analysis) {
    const hour = new Date().getHours();
    
    let timeSlot = 'morning';
    if (hour >= 11 && hour < 17) timeSlot = 'afternoon';
    else if (hour >= 17 && hour < 22) timeSlot = 'evening';
    else if (hour >= 22 || hour < 5) timeSlot = 'night';
    
    await User.findByIdAndUpdate(userId, {
      $inc: {
        [`behaviorProfile.scanPatterns.${timeSlot}`]: 1
      },
      $set: { lastActive: new Date() }
    });
  }
}

module.exports = new AnalysisController();