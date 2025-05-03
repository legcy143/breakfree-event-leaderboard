"use client"
import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react'
import { Team, teamsData as initialTeamsData } from '@/data/teams'
import type { Socket } from 'socket.io-client'
import { initSocket } from '@/utils/socket'

// Hardcoded API URL for Docker environment
const API_URL = 'http://backend:8000';

// Create the context
type TeamsContextType = {
  teams: Team[];
  updateTeamScore: (teamName: string, points: string, isDeduction?: boolean) => Promise<boolean>;
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
            name: team.name,
            img: team.img,
            score: String(team.score),
          }));
          
          setTeams(formattedTeams);
          
          // Set the last updated team for animation purposes
          if (data.updatedTeam) {
            setLastUpdated({
              name: data.updatedTeam.name,
              img: formattedTeams.find((t: any) => t.name === data.updatedTeam.name)?.img || '',
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
            name: team.name,
            img: team.img,
            score: String(team.score),
          }));
          
          setTeams(formattedTeams);
        } else {
          // If no teams in the database, initialize them
          await initializeTeams();
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
        // Fetch teams again after initializing
        await fetchTeams();
      } else {
        console.error('Failed to initialize teams:', await response.text());
      }
    } catch (error) {
      console.error('Error initializing teams:', error);
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
              name: team.name,
              img: team.img,
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

  return (
    <TeamsContext.Provider value={{ teams, updateTeamScore, isLoading, lastUpdated, animatingTeam }}>
      {children}
    </TeamsContext.Provider>
  );
}
