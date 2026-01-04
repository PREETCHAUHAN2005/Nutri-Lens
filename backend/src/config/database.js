/**
 * MongoDB Database Configuration
 * * Handles connection to MongoDB database with proper error handling
 * and connection pooling for optimal performance.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise}
 */
const connectDatabase = async () => {
  try {
    const options = {
      // REMOVED: useNewUrlParser & useUnifiedTopology (Deprecated/Default in Mongoose 6+)
      
      // Connection pool settings (Still good to have)
      maxPoolSize: 10,
      minPoolSize: 5,
      
      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ingredient-copilot',
      options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    // Print only the message to keep logs clean, or full error for debugging
    console.error('❌ MongoDB connection failed:', error.message);
    // process.exit(1); // Optional: Stop the app if DB fails to connect
    throw error;
  }
};

/**
 * Gracefully close database connection
 */
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

module.exports = {
  connectDatabase,
  closeDatabase
};