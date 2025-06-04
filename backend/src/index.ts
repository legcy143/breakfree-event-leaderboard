import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectDB } from './config/db.config';
import envConfig from './config/env.config';
import teamRoutes from './routes/team.routes';
import { initializeSocket } from './services/socket.service';

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [envConfig.corsOrigin,"http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api/teams', teamRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start the server
const PORT = envConfig.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${envConfig.nodeEnv} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err.message);
  
  // Close server & exit process
  server.close(() => {
    console.error('Server closed due to unhandled promise rejection');
    process.exit(1);
  });
});