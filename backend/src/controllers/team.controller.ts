import { Request, Response } from 'express';
import Team from '../models/team.model';
import { getIo } from '../services/socket.service';

/**
 * Get all teams
 * @route GET /api/teams
 * @access Public
 */
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find().sort({ score: -1 }); // Sort by score in descending order
    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Initialize teams
 * @route POST /api/teams
 * @access Public
 */
export const initializeTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teams } = req.body;

    if (!teams || !Array.isArray(teams)) {
      res.status(400).json({ message: 'Invalid request. Teams array is required.' });
      return;
    }

    // Check if there are already teams in the database
    const existingTeams = await Team.find();
    if (existingTeams.length > 0) {
      res.status(200).json({ message: 'Teams already initialized', teams: existingTeams });
      return;
    }

    // Create teams with scores as numbers
    const teamsToCreate = teams.map(team => ({
      name: team.name,
      img: team.img,
      score: parseInt(team.score) || 0
    }));

    await Team.insertMany(teamsToCreate);

    const createdTeams = await Team.find().sort({ score: -1 });
    res.status(201).json({ message: 'Teams initialized successfully', teams: createdTeams });
  } catch (error) {
    console.error('Error initializing teams:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Update team score
 * @route PUT /api/teams/score
 * @access Public
 */
export const updateTeamScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamName, points } = req.body;

    if (!teamName || points === undefined) {
      res.status(400).json({ message: 'Team name and points are required' });
      return;
    }

    // Find the team
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
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
    const io = getIo();
    if (io) {
      io.emit('scoreUpdate', { 
        teams: leaderboard, 
        updatedTeam: { 
          name: team.name, 
          score: team.score 
        } 
      });
    }

    res.status(200).json({ 
      message: 'Team score updated successfully', 
      team, 
      leaderboard 
    });
  } catch (error) {
    console.error('Error updating team score:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Reset all team scores to zero
 * @route PUT /api/teams/reset
 * @access Public
 */
export const resetTeamScores = async (req: Request, res: Response): Promise<void> => {
  try {
    // Update all teams to set score to 0
    await Team.updateMany({}, { $set: { score: 0 } });

    // Get all teams after reset
    const teams = await Team.find().sort({ score: -1 });

    // Emit the updated leaderboard to all connected clients
    const io = getIo();
    if (io) {
      io.emit('scoreUpdate', { teams });
    }

    res.status(200).json({ message: 'All team scores reset to zero', teams });
  } catch (error) {
    console.error('Error resetting team scores:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};