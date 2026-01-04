/**
 * AI Ingredient Co-Pilot - Main Server Entry Point
 * 
 * This file initializes the Express server, connects to MongoDB,
 * and sets up all middleware and routes for the application.
 * 
 * @hackathon - Ingredient Analysis Platform
 * @authors Piyush & Preet
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configurations
const { connectDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const analysisRoutes = require('./routes/analysis.routes');
const chatRoutes = require('./routes/chat.routes');

// Initialize Express app
const app = express();

// Security middleware - Helmet helps secure Express apps
app.use(helmet());

// CORS configuration - Allow frontend to communicate with backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Support JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint - Verify server is running
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes - Version 1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/chat', chatRoutes);

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handling middleware
app.use(errorHandler);

// Server initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 AI Ingredient Co-Pilot Server Running            ║
║                                                       ║
║  Environment: ${process.env.NODE_ENV?.padEnd(37) || 'development'.padEnd(37)}║
║  Port: ${PORT.toString().padEnd(44)}║
║  Time: ${new Date().toLocaleTimeString().padEnd(44)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;