/**
 * Gemini AI Configuration
 *
 * Initializes and exports the Gemini AI client for ingredient analysis
 * and natural language understanding.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Initialize Gemini AI client
 * @returns {GoogleGenerativeAI} Configured Gemini client
 */
const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️  GEMINI_API_KEY not found in environment variables");
    console.warn("   AI features will not work until you add your API key");
  }

  return new GoogleGenerativeAI(apiKey);
};

// Initialize the client
const genAI = initializeGemini();

/**
 * Get Gemini model instance
 * @param {string} modelName - Model name (default: gemini-pro)
 * @returns {GenerativeModel} Gemini model instance
 */
const getModel = (modelName = "gemini-pro") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Get Gemini vision model for image analysis
 * @returns {GenerativeModel} Gemini vision model instance
 */
const getVisionModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-pro-vision" });
};

/**
 * Generation configuration for consistent outputs
 */
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Safety settings to prevent harmful content
 */
const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

module.exports = {
  genAI,
  getModel,
  getVisionModel,
  generationConfig,
  safetySettings,
};
