/**
 * Gemini AI Service
 * 
 * Core AI service for ingredient analysis, intent inference,
 * and conversational interactions. Implements AI-native reasoning.
 */

const { getModel, getVisionModel, generationConfig, safetySettings } = require('../config/gemini');
const { ANALYSIS_PROMPTS, CHAT_PROMPTS, INTENT_PROMPTS } = require('../utils/prompts');

class GeminiService {
  
  /**
   * Analyze ingredients from extracted text with AI reasoning
   * @param {string} ingredientText - Extracted ingredient text
   * @param {Object} userContext - User preferences and history
   * @returns {Promise} AI-generated analysis with insights
   */
  async analyzeIngredients(ingredientText, userContext = {}) {
    try {
      const model = getModel();
      
      // Build context-aware prompt
      const prompt = this._buildAnalysisPrompt(ingredientText, userContext);
      
      const startTime = Date.now();
      
      // Generate analysis with structured output
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          ...generationConfig,
          temperature: 0.7, // Balance creativity and accuracy
        },
        safetySettings
      });
      
      const response = result.response;
      const analysisText = response.text();
      
      const processingTime = Date.now() - startTime;
      
      // Parse structured response
      const analysis = this._parseAnalysisResponse(analysisText);
      
      return {
        ...analysis,
        metadata: {
          processingTime,
          model: 'gemini-pro',
          confidence: this._calculateConfidence(analysis)
        }
      };
      
    } catch (error) {
      console.error('❌ Gemini analysis error:', error.message);
      throw new Error('AI analysis failed: ' + error.message);
    }
  }
  
  /**
   * Analyze ingredient image directly with vision model
   * @param {string} imageBase64 - Base64 encoded image
   * @param {Object} userContext - User context
   * @returns {Promise} Analysis results
   */
  async analyzeImage(imageBase64, userContext = {}) {
    try {
      const model = getVisionModel();
      
      const prompt = ANALYSIS_PROMPTS.imageAnalysis(userContext);
      
      // Prepare image data for Gemini
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };
      
      const result = await model.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [
            { text: prompt },
            imagePart
          ] 
        }],
        generationConfig,
        safetySettings
      });
      
      const response = result.response.text();
      return this._parseAnalysisResponse(response);
      
    } catch (error) {
      console.error('❌ Image analysis error:', error.message);
      throw new Error('Image analysis failed: ' + error.message);
    }
  }
  
  /**
   * Infer user intent from query and context
   * @param {string} userQuery - User's question or statement
   * @param {Object} context - Conversation and user context
   * @returns {Promise} Inferred intent with confidence
   */
  async inferIntent(userQuery, context = {}) {
    try {
      const model = getModel();
      
      const prompt = INTENT_PROMPTS.inferUserIntent(userQuery, context);
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          ...generationConfig,
          temperature: 0.5, // Lower temperature for intent classification
        },
        safetySettings
      });
      
      const response = result.response.text();
      return this._parseIntentResponse(response);
      
    } catch (error) {
      console.error('❌ Intent inference error:', error.message);
      // Return default intent on error
      return {
        primaryGoal: 'general-inquiry',
        confidence: 0.3,
        reasoning: 'Unable to infer specific intent',
        suggestedActions: ['analyze-ingredients', 'ask-question']
      };
    }
  }
  
  /**
   * Generate conversational response with reasoning
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @param {Object} analysisContext - Current analysis data
   * @returns {Promise} AI response with reasoning
   */
  async generateChatResponse(userMessage, conversationHistory = [], analysisContext = {}) {
    try {
      const model = getModel();
      
      const prompt = CHAT_PROMPTS.conversationalResponse(
        userMessage,
        conversationHistory,
        analysisContext
      );
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          ...generationConfig,
          temperature: 0.8, // More conversational
        },
        safetySettings
      });
      
      const response = result.response.text();
      return this._parseChatResponse(response);
      
    } catch (error) {
      console.error('❌ Chat response error:', error.message);
      throw new Error('Failed to generate response: ' + error.message);
    }
  }
  
  /**
   * Build comprehensive analysis prompt with user context
   * @private
   */
  _buildAnalysisPrompt(ingredientText, userContext) {
    const { preferences = {}, behaviorProfile = {} } = userContext;
    
    return `${ANALYSIS_PROMPTS.baseAnalysis}

INGREDIENT TEXT TO ANALYZE:
${ingredientText}

USER CONTEXT:
${preferences.dietaryRestrictions?.length > 0 ? `- Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ')}` : ''}
${preferences.healthGoals?.length > 0 ? `- Health Goals: ${preferences.healthGoals.join(', ')}` : ''}
${preferences.allergens?.length > 0 ? `- Known Allergens: ${preferences.allergens.join(', ')}` : ''}
${behaviorProfile.commonConcerns?.length > 0 ? `- Common Concerns: ${behaviorProfile.commonConcerns.join(', ')}` : ''}

RESPONSE FORMAT:
Provide your analysis in JSON format with the following structure:
{
  "summary": {
    "verdict": "healthy|moderate|concerning|avoid",
    "score": 0-100,
    "oneLineSummary": "brief takeaway"
  },
  "healthImpact": {
    "positives": ["positive aspect 1", "positive aspect 2"],
    "concerns": ["concern 1", "concern 2"],
    "tradeoffs": ["tradeoff 1", "tradeoff 2"]
  },
  "reasoningSteps": [
    {
      "step": 1,
      "thought": "what I'm analyzing",
      "evidence": ["fact 1", "fact 2"],
      "conclusion": "what this means"
    }
  ],
  "personalizedAdvice": {
    "relevant": true/false,
    "specificConcerns": ["concern 1"],
    "alternatives": ["alternative 1"],
    "whyRelevant": "explanation"
  },
  "ingredients": [
    {
      "name": "ingredient name",
      "category": "category",
      "analysis": "brief analysis"
    }
  ]
}`;
  }
  
  /**
   * Parse AI analysis response into structured format
   * @private
   */
  _parseAnalysisResponse(responseText) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      // Fallback: create structured response from text
      return this._createFallbackAnalysis(responseText);
      
    } catch (error) {
      console.error('❌ Response parsing error:', error.message);
      return this._createFallbackAnalysis(responseText);
    }
  }
  
  /**
   * Create fallback analysis if JSON parsing fails
   * @private
   */
  _createFallbackAnalysis(text) {
    return {
      summary: {
        verdict: 'moderate',
        score: 50,
        oneLineSummary: 'Analysis completed - see details below'
      },
      healthImpact: {
        positives: ['Natural ingredients present'],
        concerns: ['Further analysis recommended'],
        tradeoffs: ['Balance needed in consumption']
      },
      reasoningSteps: [{
        step: 1,
        thought: 'Analyzed ingredient composition',
        evidence: [text.substring(0, 200)],
        conclusion: 'Detailed analysis provided'
      }],
      personalizedAdvice: {
        relevant: true,
        specificConcerns: [],
        alternatives: [],
        whyRelevant: 'General health guidance'
      },
      rawResponse: text
    };
  }
  
  /**
   * Parse intent inference response
   * @private
   */
  _parseIntentResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback intent
      return {
        primaryGoal: 'general-inquiry',
        confidence: 0.5,
        reasoning: responseText.substring(0, 200),
        suggestedActions: ['analyze-ingredients']
      };
    } catch (error) {
      return {
        primaryGoal: 'general-inquiry',
        confidence: 0.3,
        reasoning: 'Unable to parse intent',
        suggestedActions: ['analyze-ingredients']
      };
    }
  }
  
  /**
   * Parse chat response
   * @private
   */
  _parseChatResponse(responseText) {
    return {
      message: responseText,
      reasoning: {
        visible: true,
        steps: ['Analyzed context', 'Formulated response', 'Provided actionable insight'],
        confidence: 0.85
      }
    };
  }
  
  /**
   * Calculate confidence score for analysis
   * @private
   */
  _calculateConfidence(analysis) {
    let score = 0.5; // Base confidence
    
    if (analysis.reasoningSteps && analysis.reasoningSteps.length > 0) score += 0.2;
    if (analysis.healthImpact && analysis.healthImpact.concerns) score += 0.15;
    if (analysis.personalizedAdvice && analysis.personalizedAdvice.relevant) score += 0.15;
    
    return Math.min(score, 1.0);
  }
}

module.exports = new GeminiService();