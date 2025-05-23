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
            companyName: team.companyName,
            score: team.score
          }
        });

        console.log(`Score updated for team ${teamName}: ${pointsToAdd > 0 ? '+' : ''}${pointsToAdd} points`);
      } catch (error) {
        console.error('Error updating score via socket:', error);
      }
    });

    // Listen for add team events
    socket.on('addTeam', async (data: { name: string; companyName: string; score: string }) => {
      try {
        const { name, companyName, score } = data;
        
        if (!name || !companyName) {
          console.error('Invalid add team request: missing name or company name');
          return;
        }
        
        // Check if team with same name already exists
        const existingTeam = await Team.findOne({ name });
        if (existingTeam) {
          console.error(`Team with name already exists: ${name}`);
          return;
        }
        
        // Create the new team
        const newTeam = new Team({
          name,
          companyName,
          score: parseInt(score) || 0
        });
        
        await newTeam.save();
        
        // Get all teams sorted by score
        const leaderboard = await Team.find().sort({ score: -1 });
        
        // Emit the updated leaderboard to all connected clients
        io?.emit('scoreUpdate', { teams: leaderboard });
        
        console.log(`New team added: ${name} (${companyName})`);
      } catch (error) {
        console.error('Error adding team via socket:', error);
      }
    });

    // Listen for delete team events
    socket.on('deleteTeam', async (data: { teamId: string }) => {
      try {
        const { teamId } = data;
        
        if (!teamId) {
          console.error('Invalid delete team request: missing teamId');
          return;
        }
        
        // Find and delete the team
        const team = await Team.findByIdAndDelete(teamId);
        
        if (!team) {
          console.error(`Team not found with ID: ${teamId}`);
          return;
        }
        
        // Get all teams sorted by score
        const leaderboard = await Team.find().sort({ score: -1 });
        
        // Emit the updated leaderboard to all connected clients
        io?.emit('teamDeleted', {
          teams: leaderboard,
          deletedTeam: {
            _id: team._id,
            name: team.name,
            companyName: team.companyName,
            score: team.score
          }
        });
        
        console.log(`Team deleted: ${team.name}`);
      } catch (error) {
        console.error('Error deleting team via socket:', error);
      }
    });

    // Listen for update team events
    socket.on('updateTeam', async (data: { teamId: string; name?: string; companyName?: string; score?: string }) => {
      try {
        const { teamId, name, companyName, score } = data;
        
        if (!teamId) {
          console.error('Invalid update team request: missing teamId');
          return;
        }
        
        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
          console.error(`Team not found with ID: ${teamId}`);
          return;
        }
        
        // Check for name uniqueness if name is being changed
        if (name && name !== team.name) {
          const existingTeam = await Team.findOne({ name });
          if (existingTeam) {
            console.error(`Cannot update: another team with name ${name} already exists`);
            return;
          }
        }
        
        // Update team details
        if (name) team.name = name;
        if (companyName) team.companyName = companyName;
        if (score !== undefined) team.score = parseInt(score) || 0;
        
        await team.save();
        
        // Get all teams sorted by score
        const leaderboard = await Team.find().sort({ score: -1 });
        
        // Emit the updated leaderboard to all connected clients
        io?.emit('teamUpdated', {
          teams: leaderboard,
          updatedTeam: {
            _id: team._id,
            name: team.name,
            companyName: team.companyName,
            score: team.score
          }
        });
        
        console.log(`Team updated: ${team.name}`);
      } catch (error) {
        console.error('Error updating team via socket:', error);
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