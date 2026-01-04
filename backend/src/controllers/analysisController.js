/**
 * Analysis Controller
 * 
 * Handles ingredient analysis requests, coordinates OCR and AI services,
 * and manages analysis storage and retrieval.
 */

const Analysis = require('../models/Analysis');
const geminiService = require('../services/geminiService');
const Tesseract = require('tesseract.js');

class AnalysisController {
  
  /**
   * Analyze ingredient image
   * POST /api/v1/analysis/image
   */
  async analyzeImage(req, res, next) {
    try {
      const { imageData } = req.body; // Base64 encoded image
      const userId = req.user.id;
      
      if (!imageData) {
        return res.status(400).json({
          success: false,
          message: 'Image data is required'
        });
      }
      
      // Step 1: Extract text using Tesseract OCR
      console.log('🔍 Starting OCR extraction...');
      const ocrStart = Date.now();
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: m => console.log(`OCR Progress: ${m.progress * 100}%`)
        }
      );
      
      const ocrTime = Date.now() - ocrStart;
      console.log(`✅ OCR completed in ${ocrTime}ms with ${confidence}% confidence`);
      
      // Step 2: Clean and process extracted text
      const cleanedText = this._cleanExtractedText(text);
      
      if (!cleanedText || cleanedText.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract readable text from image. Please ensure the image is clear and well-lit.'
        });
      }
      
      // Step 3: Get user context for personalization
      const userContext = await this._getUserContext(userId);
      
      // Step 4: Infer user intent
      const intent = await geminiService.inferIntent(
        `Analyzing ingredient list: ${cleanedText.substring(0, 100)}`,
        userContext
      );
      
      // Step 5: Analyze ingredients with AI
      console.log('🤖 Starting AI analysis...');
      const aiStart = Date.now();
      
      const analysis = await geminiService.analyzeIngredients(
        cleanedText,
        userContext
      );
      
      const aiTime = Date.now() - aiStart;
      console.log(`✅ AI analysis completed in ${aiTime}ms`);
      
      // Step 6: Save analysis to database
      const savedAnalysis = await Analysis.create({
        userId,
        imageData: {
          base64: imageData.substring(0, 500), // Store thumbnail only
          format: 'jpeg'
        },
        extractedText: {
          raw: text,
          cleaned: cleanedText,
          confidence: confidence,
          detectedLanguage: 'en'
        },
        ingredients: analysis.ingredients || [],
        insights: {
          summary: analysis.summary,
          healthImpact: analysis.healthImpact,
          reasoningSteps: analysis.reasoningSteps,
          personalizedAdvice: analysis.personalizedAdvice,
          context: {
            productType: this._inferProductType(cleanedText),
            intendedUse: intent.primaryGoal,
            consumptionFrequency: 'occasional',
            riskLevel: this._calculateRiskLevel(analysis)
          }
        },
        inferredIntent: intent,
        processingTime: ocrTime + aiTime,
        model: 'gemini-pro',
        promptVersion: 'v1.0'
      });
      
      // Step 7: Update user behavior profile
      await this._updateUserBehavior(userId, savedAnalysis);
      
      return res.status(200).json({
        success: true,
        message: 'Analysis completed successfully',
        data: {
          analysisId: savedAnalysis._id,
          extractedText: cleanedText,
          ocrConfidence: confidence,
          insights: savedAnalysis.insights,
          inferredIntent: intent,
          processingTime: {
            ocr: ocrTime,
            ai: aiTime,
            total: ocrTime + aiTime
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
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
        .select('-imageData.base64 -extractedText.raw'); // Exclude large fields
      
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
  
  /**
   * Clean extracted text from OCR
   * @private
   */
  _cleanExtractedText(text) {
    return text
      .replace(/[^\w\s,.:()%-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Get user context for personalization
   * @private
   */
  async _getUserContext(userId) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) return {};
    
    return {
      preferences: user.preferences,
      behaviorProfile: user.behaviorProfile
    };
  }
  
  /**
   * Infer product type from text
   * @private
   */
  _inferProductType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('cereal') || lowerText.includes('oats')) return 'breakfast';
    if (lowerText.includes('snack') || lowerText.includes('chips')) return 'snack';
    if (lowerText.includes('sauce') || lowerText.includes('dressing')) return 'condiment';
    if (lowerText.includes('drink') || lowerText.includes('beverage')) return 'beverage';
    
    return 'general';
  }
  
  /**
   * Calculate risk level from analysis
   * @private
   */
  _calculateRiskLevel(analysis) {
    if (!analysis.summary) return 'low';
    
    const score = analysis.summary.score || 50;
    
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }
  
  /**
   * Update user behavior profile based on analysis
   * @private
   */
  async _updateUserBehavior(userId, analysis) {
    const User = require('../models/User');
    const hour = new Date().getHours();
    
    let timeSlot = 'morning';
    if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
    else if (hour >= 17 && hour < 21) timeSlot = 'evening';
    else if (hour >= 21 || hour < 6) timeSlot = 'night';
    
    await User.findByIdAndUpdate(userId, {
      $inc: {
        [`behaviorProfile.scanPatterns.${timeSlot}`]: 1
      }
    });
  }
}

module.exports = new AnalysisController();