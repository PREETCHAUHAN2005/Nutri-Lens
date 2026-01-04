/**
 * Validation Middleware
 * 
 * Handles request validation using express-validator.
 */

const { validationResult } = require('express-validator');

/**
 * Check validation results and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = { validate };