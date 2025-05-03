import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
  port: process.env.PORT || 8000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/breakfree-leaderboard',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};