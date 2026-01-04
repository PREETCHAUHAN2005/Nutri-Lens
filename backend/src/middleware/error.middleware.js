/**
 * Error Handling Middleware
 * 
 * Global error handler for consistent error responses.
 */

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = 'Validation error';
    error.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(error);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    return res.status(400).json(error);
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    return res.status(400).json(error);
  }
  
  // JWT errors are handled in auth middleware
  
  // Default to 500 server error
  res.status(err.statusCode || 500).json(error);
};

module.exports = { errorHandler };