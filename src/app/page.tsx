"use client"
import { assets } from '@/assets/assets'
import { Button } from '@heroui/react'
import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useTeams } from './provider'
import { motion, AnimatePresence } from 'framer-motion'

export default function Page() {
  const { teams, isLoading, animatingTeam } = useTeams()
  const [previousRanks, setPreviousRanks] = useState<{ [key: string]: number }>({})
  const [oldTeamsOrder, setOldTeamsOrder] = useState<string[]>([])
  const firstRender = useRef(true)

  // Track previous team order for proper animations
  useEffect(() => {
    if (teams.length > 0) {
      // Sort teams by score in descending order (same as in render)
      const sortedTeamsLocal = [...teams].sort((a, b) => parseInt(b.score) - parseInt(a.score));
      
      // Save current team positions for animation reference
      const ranks: { [key: string]: number } = {}
      const newTeamOrder = sortedTeamsLocal.map(t => t.name)

      sortedTeamsLocal.forEach((team, index) => {
        ranks[team.name] = index
      })

      // Only update previous ranks if this isn't the first render
      if (!firstRender.current) {
        setPreviousRanks(ranks)
        setOldTeamsOrder(newTeamOrder)
      } else {
        // Initialize on first render
        setPreviousRanks(ranks)
        setOldTeamsOrder(newTeamOrder)
        firstRender.current = false
      }
    }
  }, [teams])

  // Helper function to determine if a team moved up or down
  const getTeamMovement = (teamName: string) => {
    if (!previousRanks || Object.keys(previousRanks).length === 0) return null;
    
    const currentIndex = sortedTeams.findIndex(t => t.name === teamName);
    const previousIndex = previousRanks[teamName] ?? currentIndex;
    
    if (currentIndex < previousIndex) return "up";
    if (currentIndex > previousIndex) return "down";
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" 
        style={{
          background: `url(${assets.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
        <div className="flex flex-col items-center gap-4">
          <img src={assets.logo} className="h-20 w-auto" alt="Breakfree Logo" />
          <div className="animate-pulse text-2xl text-brand font-bold">Loading scores...</div>
        </div>
      </div>
    )
  }
  // Sort teams by score in descending order
  const sortedTeams = [...teams].sort((a, b) => parseInt(b.score) - parseInt(a.score));
    // Check if there is any player data
  const noTeamData = teams.length === 0;

  return (
    <main
      className='min-h-[100dvh] overflow-x-hidden pb-4'
      style={{
        background: `url(${assets.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      {/* More responsive header with flexible layout */}
      <div className='h-auto min-h-[4rem] px-3 sm:px-5 py-2 flex flex-wrap justify-between items-center gap-2'>
        <img src={assets.logo} className='h-12 sm:h-16 w-auto object-contain mx-auto md:mx-0' />
        {/* <Link href="/admin" className="mx-auto md:mx-0">
          <Button color="primary" variant="solid" className="text-xs sm:text-sm font-bold whitespace-nowrap">
            Manage Scores
          </Button>
        </Link> */}
      </div>
      
      <h1 className='text-center uppercase text-2xl sm:text-3xl lg:text-5xl font-bold text-brand mt-1 mb-4 sm:mb-8 lg:mb-16'>live scoreboard</h1>
        {/* Animated leaderboard */}      <motion.section 
        className='p-2 max-w-[70rem] mx-auto px-2 sm:px-4 flex-1 overflow-y-auto'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}      >        {noTeamData ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-brand mb-3">Scoreboard Empty</h2>
              <p className="text-xl text-brand/80">Waiting for participants...</p>
              <div className="mt-6 animate-pulse">
                <svg className="w-12 h-12 text-brand/60 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <AnimatePresence>
              {sortedTeams.slice(0, 10).map((team, index) => {
              const teamMovement = getTeamMovement(team.name);
              const wasUpdated = animatingTeam === team.name;
              
              return (
                <motion.div
                  layout
                  layoutId={`team-${team.name}`}
                  key={team.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    backgroundColor: wasUpdated ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0)",
                    transition: {
                      type: teamMovement ? "spring" : "tween",
                      stiffness: 400,
                      damping: 35,
                      duration: teamMovement ? 0.8 : 0.5
                    }
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 25 }
                  }}
                  className={`flex justify-between items-center p-2 sm:p-3 md:p-4 gap-2 sm:gap-3 lg:gap-10 border-b border-brand/20 rounded-lg relative mb-1 ${
                    wasUpdated ? 'ring-2 ring-brand' : ''
                  } ${teamMovement === "up" ? "z-10" : ""}`}
                >
                  {/* Position change indicator */}
                  {teamMovement && (
                    <motion.div 
                      initial={{ opacity: 0, x: teamMovement === "up" ? -30 : 30 }}
                      animate={{ opacity: [0, 1, 0], x: 0 }}
                      transition={{ duration: 1.5 }}
                      className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-7 ${
                        teamMovement === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {teamMovement === "up" ? "▲" : "▼"}
                    </motion.div>
                  )}
                  
                  {/* Rank indicator with animation */}
                  <motion.div 
                    className='bg-brand shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-white text-xs sm:text-base font-bold z-10'
                    animate={{ 
                      scale: wasUpdated || teamMovement ? [1, 1.2, 1] : 1,
                      backgroundColor: teamMovement === "up" ? ["#00a99d", "#4CAF50", "#00a99d"] : 
                                       teamMovement === "down" ? ["#00a99d", "#f44336", "#00a99d"] : "#00a99d"
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {index + 1}
                  </motion.div>
                  
                  {/* Team name */}
                  {/* <div className="flex flex-row text-center gap-10  mr-auto bg-red-500 w-[50%]"> */}
                    <motion.h2 
                      className='text-sm sm:text-base md:text-xl lg:text-2xl w-[50%] font-bold text-brand truncate capitalize'
                    >
                      {team.name}
                    </motion.h2>
                  {/* </div> */}
                    {team.companyName && (
                      <motion.p 
                        className='text-sm sm:text-base md:text-xl lg:text-2xl mr-auto w-full text-center font-bold  text-brand/80 truncate capitalize'
                      >
                        {team.companyName}
                      </motion.p>
                    )}
                  
                  {/* Score with animation */}
                  <motion.div className="relative">
                    <motion.h2 
                      className='text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-brand'
                      animate={{ 
                        scale: wasUpdated ? [1, 1.3, 1] : 1,
                        color: wasUpdated ? 
                          ["#00a99d", "#ff9d00", "#00a99d"] : "#00a99d" 
                      }}
                      transition={{ 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 300,
                        damping: 15
                      }}
                    >
                      {team.score}
                    </motion.h2>
                    
                    {/* Score change indicator - supports both increases and decreases */}
                    {wasUpdated && (
                      <motion.div 
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -20 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className={`absolute -top-8 left-0 right-0 text-center font-bold ${
                          parseInt(team.score) > (parseInt(String(previousRanks[team.name])) || 0) 
                            ? "text-green-500" 
                            : parseInt(team.score) < (parseInt(String(previousRanks[team.name])) || 0)
                              ? "text-amber-600" 
                              : "text-blue-500"
                        }`}
                      >
                        {parseInt(team.score) > (parseInt(String(previousRanks[team.name])) || 0) 
                          ? `+${parseInt(team.score) - (parseInt(String(previousRanks[team.name])) || 0)}` 
                          : parseInt(team.score) < (parseInt(String(previousRanks[team.name])) || 0)
                            ? `-${(parseInt(String(previousRanks[team.name])) || 0) - parseInt(team.score)}` 
                            : "±0"}
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Background pulse animation */}
                  {wasUpdated && (
                    <motion.div 
                      initial={{ opacity: 0.5, scale: 0.8 }}
                      animate={{ opacity: 0, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 bg-brand/20 rounded-lg z-0"
                    />
                  )}
                  
                  {/* Position change highlight */}
                  {teamMovement && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.2, 0],
                        backgroundColor: teamMovement === "up" ? "rgba(76, 175, 80, 0.3)" : "rgba(244, 67, 54, 0.3)" 
                      }}
                      transition={{ duration: 1.5 }}
                      className="absolute inset-0 rounded-lg z-0"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {sortedTeams.length > 10 && (
            <div className="text-center mt-4 text-sm text-brand/70 italic">
              Showing top 10 teams out of {sortedTeams.length} total
            </div>          )}
        </div>
        )}
      </motion.section>
    </main>
  )
}
