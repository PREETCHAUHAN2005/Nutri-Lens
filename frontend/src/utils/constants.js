export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 10,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  COMPRESSION_QUALITY: 0.8,
  MAX_WIDTH: 1200,
};

export const MESSAGES = {
  ERROR: {
    INVALID_IMAGE: "Please select a valid image file (JPG, PNG, WebP).",
    IMAGE_TOO_LARGE: "Image is too large. Please select a file under 10MB.",
    ANALYSIS_FAILED: "We couldn't analyze that image. Please try again with a clearer photo.",
  }
};

export const VERDICTS = {
  HEALTHY: 'healthy',
  MODERATE: 'moderate',
  CONCERNING: 'concerning',
  AVOID: 'avoid'
};