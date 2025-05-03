// Environment configuration
// We're using hardcoded values for Docker production use

export default {
  port: process.env.PORT || 8000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/breakfree-leaderboard',
  nodeEnv: process.env.NODE_ENV || 'production',
  corsOrigin: process.env.CORS_ORIGIN || 'http://frontend:3000'
};