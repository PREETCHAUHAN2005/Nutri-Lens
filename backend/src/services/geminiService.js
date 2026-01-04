/**
 * Gemini AI Service
 * * Handles all interactions with Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // ✅ FORCE USE of 'gemini-1.5-flash'. 
    // Do NOT change this to 'gemini-pro' as that model is deleted.
    this.modelName = 'gemini-1.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  async inferIntent(text, userContext) {
    try {
      // Log ensuring we are using the correct model
      console.log(`🤖 Gemini Request (${this.modelName}): Inferring intent...`);

      const prompt = `
        You are an AI nutritionist. Analyze the user's likely goal.
        User Text: "${text}"
        User Profile: ${JSON.stringify(userContext)}
        Return ONLY a JSON object (no markdown) with this structure:
        {
          "primaryGoal": "check_safety" | "health_rating" | "diet_compliance",
          "specificConcerns": ["sugar", "peanuts"],
          "reasoning": "User has a nut allergy..."
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this._parseJSON(response.text());
      
    } catch (error) {
      // If this errors, we want to see the REAL error for 1.5-flash, not a fallback error
      console.error(`❌ Intent Error on ${this.modelName}:`, error.message);
      // Return a safe default so the app doesn't crash
      return { 
        primaryGoal: 'health_rating', 
        specificConcerns: [], 
        reasoning: 'AI service temporarily unavailable' 
      };
    }
  }

  async analyzeIngredients(cleanedText, context) {
    try {
      console.log(`🤖 Gemini Request (${this.modelName}): Analyzing ingredients...`);

      const prompt = `
        Analyze this ingredient list: "${cleanedText}"
        User Context: ${JSON.stringify(context)}
        
        Provide a detailed nutritional analysis in JSON format ONLY.
        Structure:
        {
          "ingredients": [{"name": "string", "risk": "low"|"medium"|"high", "description": "string"}],
          "summary": {
            "verdict": "healthy"|"moderate"|"avoid",
            "score": 0-100,
            "oneLineSummary": "string"
          },
          "healthImpact": {
            "positives": ["string"],
            "concerns": ["string"],
            "tradeoffs": ["string"]
          },
          "reasoningSteps": [
            {"step": 1, "thought": "string", "conclusion": "string"}
          ],
          "personalizedAdvice": {
            "relevant": boolean,
            "whyRelevant": "string",
            "alternatives": ["string"]
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this._parseJSON(response.text());

    } catch (error) {
      console.error(`❌ Analysis Error on ${this.modelName}:`, error.message);
      throw new Error(`AI analysis failed on model ${this.modelName}: ${error.message}`);
    }
  }

  _parseJSON(text) {
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI JSON response");
      return {}; 
    }
  }
}

module.exports = new GeminiService();