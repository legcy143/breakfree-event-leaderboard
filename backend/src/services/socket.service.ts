import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import Team from '../models/team.model';
import envConfig from '../config/env.config';

let io: Server | null = null;

/**
 * Initialize Socket.IO
 * @param httpServer HTTP server to attach Socket.IO to
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: envConfig.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Listen for score update events from clients
    socket.on('updateScore', async (data: { teamName: string; points: string }) => {
      try {
        const { teamName, points } = data;

        if (!teamName || points === undefined) {
          console.error('Invalid update score request: missing teamName or points');
          return;
        }

        // Find the team
        const team = await Team.findOne({ name: teamName });
        if (!team) {
          console.error(`Team not found: ${teamName}`);
          return;
        }

        // Convert points to a number and update the score
        const pointsToAdd = parseInt(points);
        team.score += pointsToAdd;

        // Save the updated team
        await team.save();

        // Get all teams sorted by score to update the leaderboard
        const leaderboard = await Team.find().sort({ score: -1 });

        // Emit the updated leaderboard to all connected clients
        io?.emit('scoreUpdate', {
          teams: leaderboard,
          updatedTeam: {
            name: team.name,
            score: team.score
          }
        });

        console.log(`Score updated for team ${teamName}: ${pointsToAdd > 0 ? '+' : ''}${pointsToAdd} points`);
      } catch (error) {
        console.error('Error updating score via socket:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the Socket.IO instance
 * @returns The Socket.IO instance or null if not initialized
 */
export const getIo = (): Server | null => {
  return io;
};