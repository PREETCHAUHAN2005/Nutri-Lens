import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.worker = null;
  }

  /**
   * Initialize Tesseract worker
   * @private
   */
  async _initWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker({
        logger: (m) => {
          // Log progress for debugging
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
    return this.worker;
  }

  /**
   * Extract text from image (client-side)
   * Note: This is backup functionality. Primary OCR happens on backend.
   * 
   * @param {string} imageData - Base64 encoded image or File object
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Extracted text and confidence
   */
  async extractText(imageData, onProgress = null) {
    try {
      const worker = await this._initWorker();

      const {
        data: { text, confidence },
      } = await worker.recognize(imageData, {
        logger: onProgress
          ? (m) => {
              if (m.status === 'recognizing text') {
                onProgress(m.progress);
              }
            }
          : undefined,
      });

      return {
        text: text.trim(),
        confidence: Math.round(confidence),
        success: true,
      };
    } catch (error) {
      console.error('❌ OCR Error:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Preprocess image for better OCR results
   * @param {string} imageData - Base64 image
   * @returns {Promise<string>} Processed image
   */
  async preprocessImage(imageData) {
    // This would contain image preprocessing logic
    // For now, return original image
    return imageData;
  }

  /**
   * Cleanup worker
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export default new OCRService();