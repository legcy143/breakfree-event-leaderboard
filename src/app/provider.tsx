"use client"
import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react'
import { Team, teamsData as initialTeamsData } from '@/data/teams'
import type { Socket } from 'socket.io-client'
import { initSocket } from '@/utils/socket'

// Hardcoded API URL for Docker environment
const API_URL = 'https://break-free-backend.gokapturehub.com';
// const API_URL = 'http://localhost:8081';

// Create the context
type TeamsContextType = {
  teams: Team[];
  updateTeamScore: (teamName: string, points: string, isDeduction?: boolean) => Promise<boolean>;
  addNewTeam: (name: string, companyName: string, score: string) => Promise<boolean>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  updateTeam: (teamId: string, name: string, companyName: string, score: string) => Promise<boolean>;
  isLoading: boolean;
  lastUpdated: Team | null;
  animatingTeam: string | null;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

// Custom hook to use the teams context
export const useTeams = () => {
  const context = useContext(TeamsContext)
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider')
  }
  return context
}

// Provider component
export default function Provider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(initialTeamsData)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Team | null>(null)
  const [animatingTeam, setAnimatingTeam] = useState<string | null>(null)
  const socketInitialized = useRef(false)
  const socketRef = useRef<Socket | null>(null)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection and fetch initial data
  useEffect(() => {
    // Only initialize socket once
    if (socketInitialized.current) return;
    
    // Set a fallback timeout to fetch data even if socket connection fails
    fetchTimeoutRef.current = setTimeout(() => {
      console.log('Socket connection timeout, fetching data directly');
      if (isLoading) {
        fetchTeams();
      }
    }, 5000); // 5 second timeout
    
    try {
      // Initialize Socket.IO connection
      const socket = initSocket();
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        socketInitialized.current = true;
        
        // Clear the fallback timeout as socket connected successfully
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = null;
        }
        
        // Fetch teams data once connected
        fetchTeams();
      });

      socket.on('connect_error', (err: any) => {
        console.error('Socket connection error:', err.message);
        // On connection error, fetch data directly if still loading
        if (isLoading) {
          fetchTeams();
        }
      });

      socket.on('scoreUpdate', (data: any) => {
        console.log('Score update received:', data);
        
        if (data && data.teams) {
          // Transform the MongoDB data to match our Team type
          const formattedTeams = data.teams.map((team: any) => ({
            id: team._id,
            name: team.name,
            companyName: team.companyName,
            score: String(team.score),
          }));
          
          setTeams(formattedTeams);
          
          // Set the last updated team for animation purposes
          if (data.updatedTeam) {
            setLastUpdated({
              id: data.updatedTeam._id,
              name: data.updatedTeam.name,
              companyName: data.updatedTeam.companyName,
              score: String(data.updatedTeam.score),
            });
            
            // Set the animating team ID
            setAnimatingTeam(data.updatedTeam.name);
            
            // Clear animation after a delay
            setTimeout(() => {
              setAnimatingTeam(null);
            }, 2000); // Animation duration
          }
        }
      });

      // Listen for team deleted events
      socket.on('teamDeleted', (data: any) => {
        console.log('Team deleted event received:', data);
        
        if (data && data.teams) {
          // Transform the MongoDB data to match our Team type
          const formattedTeams = data.teams.map((team: any) => ({
            id: team._id,
            name: team.name,
            companyName: team.companyName,
            score: String(team.score),
          }));
          
          setTeams(formattedTeams);
        }
      });

      // Listen for team updated events
      socket.on('teamUpdated', (data: any) => {
        console.log('Team updated event received:', data);
        
        if (data && data.teams) {
          // Transform the MongoDB data to match our Team type
          const formattedTeams = data.teams.map((team: any) => ({
            id: team._id,
            name: team.name,
            companyName: team.companyName,
            score: String(team.score),
          }));
          
          setTeams(formattedTeams);
          
          // Set the last updated team for animation purposes
          if (data.updatedTeam) {
            setLastUpdated({
              id: data.updatedTeam._id,
              name: data.updatedTeam.name,
              companyName: data.updatedTeam.companyName,
              score: String(data.updatedTeam.score),
            });
            
            // Set the animating team ID
            setAnimatingTeam(data.updatedTeam.name);
            
            // Clear animation after a delay
            setTimeout(() => {
              setAnimatingTeam(null);
            }, 2000); // Animation duration
          }
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        socketInitialized.current = false;
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      // On socket initialization error, fetch data directly
      fetchTeams();
    }

    // Clean up socket connection and timeout on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount
  // Fetch teams from the API
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/teams`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Transform the MongoDB data to match our Team type
          const formattedTeams = data.map((team: any) => ({
            id: team._id,
            name: team.name,
            companyName: team.companyName,
            score: String(team.score),
          }));
          
          setTeams(formattedTeams);
        } else if (initialTeamsData.length > 0) {
          // If no teams in the database and we have initial data, initialize them
          // We'll avoid calling fetchTeams again from inside initializeTeams
          await initializeTeams();
        } else {
          // If there's no data and no initial teams, just set empty array
          setTeams([]);
          console.log('No teams found and no initial data to populate');
        }
      } else {
        console.error('Failed to fetch teams:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Initialize teams in the database if needed
  const initializeTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teams: initialTeamsData }),
      });

      if (response.ok) {
        console.log('Teams initialized in the database');
        // Instead of calling fetchTeams again (which can cause an infinite loop),
        // we'll directly set the teams from our initialTeamsData
        setTeams(initialTeamsData);
      } else {
        console.error('Failed to initialize teams:', await response.text());
      }
    } catch (error) {
      console.error('Error initializing teams:', error);
    }
  };

  // Function to add a new team
  const addNewTeam = async (name: string, companyName: string, score: string): Promise<boolean> => {
    try {
      // Using Socket.IO to add a new team
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('addTeam', { name, companyName, score });
        return true;
      } else {
        console.warn('Socket not connected. Falling back to API call.');
        // Fallback to direct API call if socket is not connected
        const response = await fetch(`${API_URL}/api/teams/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, companyName, score }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.leaderboard) {
            // Transform the MongoDB data to match our Team type
            const formattedTeams = data.leaderboard.map((team: any) => ({
              name: team.name,
              companyName: team.companyName,
              score: String(team.score),
            }));
            
            setTeams(formattedTeams);
          }
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error adding team:', error);
      return false;
    }
  };

  // Function to update a team's score
  const updateTeamScore = async (teamName: string, points: string, isDeduction: boolean = false): Promise<boolean> => {
    try {
      // Convert points to a number and apply negative sign if it's a deduction
      const pointsValue = isDeduction ? `-${points}` : points;
      
      // Using Socket.IO to update the score
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('updateScore', { teamName, points: pointsValue });
        return true;
      } else {
        console.warn('Socket not connected. Falling back to API call.');
        // Fallback to direct API call if socket is not connected
        const response = await fetch(`${API_URL}/api/teams/score`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ teamName, points: pointsValue }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.leaderboard) {
            // Transform the MongoDB data to match our Team type
            const formattedTeams = data.leaderboard.map((team: any) => ({
              id: team._id,
              name: team.name,
              companyName: team.companyName,
              score: String(team.score),
            }));
            
            setTeams(formattedTeams);
          }
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error updating score:', error);
      return false;
    }
  };

  // Function to delete a team
  const deleteTeam = async (teamId: string): Promise<boolean> => {
    try {
      // Using Socket.IO to delete a team
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('deleteTeam', { teamId });
        return true;
      } else {
        console.warn('Socket not connected. Falling back to API call.');
        // Fallback to direct API call if socket is not connected
        const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.leaderboard) {
            // Transform the MongoDB data to match our Team type
            const formattedTeams = data.leaderboard.map((team: any) => ({
              id: team._id,
              name: team.name,
              companyName: team.companyName,
              score: String(team.score),
            }));
            
            setTeams(formattedTeams);
          }
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      return false;
    }
  };

  // Function to update a team's details
  const updateTeam = async (teamId: string, name: string, companyName: string, score: string): Promise<boolean> => {
    try {
      // Using Socket.IO to update the team
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('updateTeam', { teamId, name, companyName, score });
        return true;
      } else {
        console.warn('Socket not connected. Falling back to API call.');
        // Fallback to direct API call if socket is not connected
        const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, companyName, score }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.leaderboard) {
            // Transform the MongoDB data to match our Team type
            const formattedTeams = data.leaderboard.map((team: any) => ({
              id: team._id,
              name: team.name,
              companyName: team.companyName,
              score: String(team.score),
            }));
            
            setTeams(formattedTeams);
          }
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error updating team:', error);
      return false;
    }
  };

  return (
    <TeamsContext.Provider value={{ teams, updateTeamScore, addNewTeam, isLoading, lastUpdated, animatingTeam, deleteTeam, updateTeam }}>
      {children}
    </TeamsContext.Provider>
  );
}
