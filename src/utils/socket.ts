import { io, Socket } from 'socket.io-client';

// Get the API URL from environment variables or use the default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  // Log socket connection events in development
  if (process.env.NODE_ENV !== 'production') {
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
  }

  return socket;
};