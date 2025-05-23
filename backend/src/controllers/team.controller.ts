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
      companyName: team.companyName,
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
          companyName: team.companyName,
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

/**
 * Add a new team
 * @route POST /api/teams/add
 * @access Public
 */
export const addTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, companyName, score } = req.body;

    if (!name || !companyName) {
      res.status(400).json({ message: 'Name and company name are required' });
      return;
    }

    // Check if team with same name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      res.status(400).json({ message: 'Team with this name already exists' });
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
    const teams = await Team.find().sort({ score: -1 });

    // Emit the updated leaderboard to all connected clients
    const io = getIo();
    if (io) {
      io.emit('scoreUpdate', { teams });
    }

    res.status(201).json({ 
      message: 'Team added successfully',
      team: newTeam,
      leaderboard: teams
    });
  } catch (error) {
    console.error('Error adding team:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Delete a team
 * @route DELETE /api/teams/:teamId
 * @access Public
 */
export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.params.teamId;

    if (!teamId) {
      res.status(400).json({ message: 'Team ID is required' });
      return;
    }

    // Find and delete the team
    const team = await Team.findByIdAndDelete(teamId);
    
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    // Get all teams sorted by score
    const teams = await Team.find().sort({ score: -1 });

    // Emit the updated leaderboard to all connected clients
    const io = getIo();
    if (io) {
      io.emit('teamDeleted', { 
        teams,
        deletedTeam: {
          _id: team._id,
          name: team.name,
          companyName: team.companyName,
          score: team.score
        }
      });
    }

    res.status(200).json({ 
      message: 'Team deleted successfully',
      teamId: team._id,
      leaderboard: teams
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Update team details
 * @route PUT /api/teams/:teamId
 * @access Public
 */
export const updateTeamDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.params.teamId;
    const { name, companyName, score } = req.body;

    if (!teamId) {
      res.status(400).json({ message: 'Team ID is required' });
      return;
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    // Check if another team with the same name exists (only if name is being updated)
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name });
      if (existingTeam) {
        res.status(400).json({ message: 'Another team with this name already exists' });
        return;
      }
    }

    // Update team details
    if (name) team.name = name;
    if (companyName) team.companyName = companyName;
    if (score !== undefined) team.score = parseInt(score) || 0;

    await team.save();

    // Get all teams sorted by score
    const teams = await Team.find().sort({ score: -1 });

    // Emit the updated leaderboard to all connected clients
    const io = getIo();
    if (io) {
      io.emit('teamUpdated', { 
        teams,
        updatedTeam: {
          _id: team._id,
          name: team.name,
          companyName: team.companyName,
          score: team.score
        }
      });
    }

    res.status(200).json({ 
      message: 'Team details updated successfully',
      team,
      leaderboard: teams
    });
  } catch (error) {
    console.error('Error updating team details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};