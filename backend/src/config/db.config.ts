import mongoose from 'mongoose';
import envConfig from './env.config';

/**
 * Connect to MongoDB
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(envConfig.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};