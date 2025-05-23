import { Router } from 'express';
import { 
  getTeams, 
  initializeTeams, 
  updateTeamScore, 
  resetTeamScores, 
  addTeam,
  deleteTeam,
  updateTeamDetails 
} from '../controllers/team.controller';

const router = Router();

// Get all teams
router.get('/', getTeams);

// Initialize teams
router.post('/', initializeTeams);

// Add a new team
router.post('/add', addTeam);

// Update team score
router.put('/score', updateTeamScore);

// Reset all team scores to zero
router.put('/reset', resetTeamScores);

// Delete a team
router.delete('/:teamId', deleteTeam);

// Update team details
router.put('/:teamId', updateTeamDetails);

export default router;