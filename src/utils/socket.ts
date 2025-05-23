import { io, Socket } from 'socket.io-client';

// Hardcoded API URL for Docker environment
const API_URL = 'https://break-free-backend.gokapturehub.com/';
// const API_URL = 'http://localhost:8081/';

/**
 * Initialize Socket.IO connection
 * @returns Socket instance
 */
export const initSocket = (): Socket => {
  const socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 5000,
  });

  // Log socket connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('reconnect', (attempt) => {
    console.log('Socket reconnected after', attempt, 'attempts');
  });

  return socket;
};