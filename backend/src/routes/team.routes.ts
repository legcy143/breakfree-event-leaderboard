import { Router } from 'express';
import { getTeams, initializeTeams, updateTeamScore, resetTeamScores } from '../controllers/team.controller';

const router = Router();

// Get all teams
router.get('/', getTeams);

// Initialize teams
router.post('/', initializeTeams);

// Update team score
router.put('/score', updateTeamScore);

// Reset all team scores to zero
router.put('/reset', resetTeamScores);

export default router;