class GeminiServiceFrontend {
  /**
   * For this implementation, we route all Gemini calls through backend API
   * This service exists for potential future direct integrations
   */
  
  /**
   * Validate image before sending to backend
   * @param {string} base64Image - Base64 encoded image
   * @returns {Object} Validation result
   */
  validateImage(base64Image) {
    try {
      // Check if it's a valid base64 string
      if (!base64Image || typeof base64Image !== 'string') {
        return { valid: false, error: 'Invalid image data' };
      }

      // Check if it has data URL prefix
      if (!base64Image.startsWith('data:image/')) {
        return { valid: false, error: 'Image must be in data URL format' };
      }

      // Extract image size (approximate)
      const base64Length = base64Image.length;
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 10) {
        return { valid: false, error: 'Image size must be less than 10MB' };
      }

      return { valid: true, sizeInMB: sizeInMB.toFixed(2) };
    } catch (error) {
        console.error("Image validation error", error);    
      return { valid: false, error: 'Failed to validate image' };
    }
  }

  /**
   * Prepare image for backend transmission
   * @param {string} base64Image - Base64 encoded image
   * @returns {string} Cleaned base64 string
   */
  prepareImageForBackend(base64Image) {
    // Backend expects just the base64 data, not the data URL prefix
    // But we'll keep it for now as backend handles both formats
    return base64Image;
  }
}

export default new GeminiServiceFrontend();