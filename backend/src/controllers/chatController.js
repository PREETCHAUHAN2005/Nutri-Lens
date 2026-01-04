/**
 * Chat Controller
 * 
 * Manages conversational interactions for follow-up questions
 * and deeper ingredient understanding.
 */

const Conversation = require('../models/Conversation');
const Analysis = require('../models/Analysis');
const geminiService = require('../services/geminiService');

class ChatController {
  
  /**
   * Start new conversation for an analysis
   * POST /api/v1/chat/start
   */
  async startConversation(req, res, next) {
    try {
      const { analysisId } = req.body;
      const userId = req.user.id;
      
      // Verify analysis exists and belongs to user
      const analysis = await Analysis.findOne({ _id: analysisId, userId });
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
      }
      
      // Create new conversation
      const conversation = await Conversation.create({
        userId,
        analysisId,
        context: {
          productName: analysis.extractedText.cleaned.substring(0, 50),
          mainConcerns: analysis.insights.healthImpact.concerns || [],
          userIntent: analysis.inferredIntent.primaryGoal,
          keyIngredients: analysis.ingredients.slice(0, 5).map(i => i.name)
        },
        messages: [{
          role: 'system',
          content: `Conversation started for analysis ${analysisId}`,
          timestamp: new Date()
        }]
      });
      
      return res.status(201).json({
        success: true,
        message: 'Conversation started',
        data: {
          conversationId: conversation._id,
          context: conversation.context
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Send message in conversation
   * POST /api/v1/chat/:conversationId/message
   */
  async sendMessage(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { message } = req.body;
      const userId = req.user.id;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty'
        });
      }
      
      // Get conversation with analysis context
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId
      }).populate('analysisId');
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Prepare context for AI
      const analysisContext = {
        summary: conversation.analysisId.insights.summary,
        healthImpact: conversation.analysisId.insights.healthImpact,
        mainIngredients: conversation.context.keyIngredients
      };
      
      // Generate AI response with reasoning
      const startTime = Date.now();
      
      const aiResponse = await geminiService.generateChatResponse(
        message,
        conversation.messages.slice(-10), // Last 10 messages for context
        analysisContext
      );
      
      const processingTime = Date.now() - startTime;
      
      // Add AI message to conversation
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        reasoning: aiResponse.reasoning,
        metadata: {
          model: 'gemini-pro',
          processingTime
        }
      });
      
      // Update conversation context if needed
      await this._updateConversationContext(conversation, message, aiResponse);
      
      await conversation.save();
      
      return res.status(200).json({
        success: true,
        data: {
          message: aiResponse.message,
          reasoning: aiResponse.reasoning,
          processingTime
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get conversation history
   * GET /api/v1/chat/:conversationId
   */
  async getConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId
      }).populate('analysisId', 'insights.summary extractedText.cleaned');
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: conversation
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get all conversations for user
   * GET /api/v1/chat/conversations
   */
  async getUserConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const conversations = await Conversation.find({ userId })
        .populate('analysisId', 'insights.summary createdAt')
        .sort({ lastMessageAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await Conversation.countDocuments({ userId });
      
      return res.status(200).json({
        success: true,
        data: {
          conversations,
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
   * Update conversation context based on interaction
   * @private
   */
  async _updateConversationContext(conversation, userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Extract new concerns from conversation
    if (lowerMessage.includes('concern') || lowerMessage.includes('worried')) {
      const concerns = conversation.context.mainConcerns || [];
      if (!concerns.includes(userMessage.substring(0, 50))) {
        concerns.push(userMessage.substring(0, 50));
        conversation.context.mainConcerns = concerns.slice(-5); // Keep last 5
      }
    }
    
    // Update user intent if it shifts
    if (lowerMessage.includes('alternative') || lowerMessage.includes('instead')) {
      conversation.context.userIntent = 'seeking-alternatives';
    }
  }
}

module.exports = new ChatController();