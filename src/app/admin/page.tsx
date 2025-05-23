"use client"
import { assets } from '@/assets/assets'
import { Button } from '@heroui/react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Team } from '@/data/teams'
import { useTeams } from '../provider'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPage() {
  const { teams, updateTeamScore, isLoading, lastUpdated } = useTeams()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [points, setPoints] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isDeduction, setIsDeduction] = useState<boolean>(false)

  // Update selected team if the team data changes
  useEffect(() => {
    if (selectedTeam) {
      // Find the updated team data
      const updatedTeam = teams.find(team => team.name === selectedTeam.name)
      if (updatedTeam && updatedTeam.score !== selectedTeam.score) {
        setSelectedTeam(updatedTeam)
      }
    }
  }, [teams, selectedTeam])

  // Function to handle numpad button clicks
  const handleNumpadClick = (value: string) => {
    if (value === 'clear') {
      setPoints('')
    } else if (value === 'delete') {
      setPoints(prev => prev.slice(0, -1))
    } else if (points.length < 5) { // Limit to 5 digits
      setPoints(prev => prev + value)
    }
  }

  // Toggle between adding and deducting points
  const toggleScoreMode = () => {
    setIsDeduction(prev => !prev);
  }

  // Function to submit the score
  const handleSubmit = async () => {
    if (!selectedTeam || !points || submitting) return
    
    try {
      setSubmitting(true)
      
      // Call the updateTeamScore function from context with the deduction flag
      const result = await updateTeamScore(selectedTeam.name, points, isDeduction)
      
      if (result as any) {
        // Set success message
        const action = isDeduction ? "deducted from" : "added to";
        setSuccessMessage(`${points} points ${action} ${selectedTeam.name}`)
        
        // Show success message
        setShowSuccess(true)
        
        // Reset after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
          setSelectedTeam(null)
          setPoints('')
          setSubmitting(false)
          setSuccessMessage('')
        }, 3000)
      } else {
        console.error('Failed to update team score')
        setSubmitting(false)
      }
    } catch (error) {
      console.error('Error updating score:', error)
      setSubmitting(false)
    }
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
          <div className="animate-pulse text-2xl text-gray-800 font-bold">Loading teams...</div>
        </div>
      </div>
    )
  }

  return (
    <main
      className='min-h-[100dvh] overflow-x-hidden pb-8'
      style={{
        background: `url(${assets.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      {/* Header with responsive padding and flexible layout */}
      <div className='h-auto min-h-[4rem] px-3 sm:px-5 py-2 flex flex-wrap justify-between items-center gap-2'>
        <img src={assets.logo} className='h-12 sm:h-16 w-auto object-contain' />
        <Link href="/">
          <Button color="primary" variant="solid" className="text-xs sm:text-sm font-bold whitespace-nowrap">
            View Leaderboard
          </Button>
        </Link>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className='text-center uppercase text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand mb-4 sm:mb-8'>Score Management</h1>
        
        {/* Debug info - only in development */}
        {process.env.NODE_ENV === 'development' && lastUpdated && (
          <div className="bg-gray-100 p-2 text-xs mb-4 rounded">
            <p>Last updated: {lastUpdated.name} - Current score: {lastUpdated.score}</p>
          </div>
        )}
        
        {/* Animated success message with Framer Motion */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`border px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-4 sm:mb-6 text-center ${
                isDeduction ? "bg-amber-100 border-amber-400 text-amber-700" : "bg-green-100 border-green-400 text-green-700"
              }`}
            >
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stack grid vertically on mobile, side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Team Selection Section - improved padding and grid responsiveness */}
          <div className="bg-white/90 rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">1. Select Team</h2>
            
            {/* Responsive grid that adapts to different screen sizes */}
            <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {teams.map((team, index) => (
                <motion.div 
                  key={team.name} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={lastUpdated?.name === team.name ? { backgroundColor: ['rgba(0,169,157,0.1)', 'rgba(0,169,157,0.3)', 'rgba(0,169,157,0.1)'] } : {}}
                  transition={{ duration: 1 }}
                  className={`cursor-pointer p-2 sm:p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                    selectedTeam?.name === team.name ? 'border-brand bg-brand/10' : 'border-gray-200 hover:border-brand/50'
                  }`}
                  onClick={() => setSelectedTeam(team)}
                >
                  {/* <img src={team.img} alt={team.name} className="h-8 sm:h-10 md:h-12 object-contain mb-1 sm:mb-2" /> */}
                  <p className="text-xs sm:text-sm font-medium text-center text-gray-800 line-clamp-2 min-h-[2.5em]">{team.name}</p>
                  <motion.p 
                    key={`score-${team.name}-${team.score}`}
                    initial={{ scale: lastUpdated?.name === team.name ? 1.5 : 1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-xs font-semibold mt-1"
                  >
                    {team.score} points
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Numpad Section - better spacing for small screens */}
          <div className="bg-white/90 rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">2. Enter Points</h2>
              
              {/* Add/Deduct Toggle Button */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  color={isDeduction ? "warning" : "primary"} 
                  className="flex items-center gap-2"
                  onClick={toggleScoreMode}
                >
                  <span>{isDeduction ? "- Deduct" : "+ Add"}</span>
                </Button>
              </motion.div>
            </div>
            
            {selectedTeam ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={`selected-${selectedTeam.name}-${selectedTeam.score}`}
                className="mb-3 sm:mb-4 flex items-center gap-2"
              >
                {/* <img src={selectedTeam.img} alt={selectedTeam.name} className="h-6 sm:h-8 w-auto object-contain" /> */}
                <div>
                  <p className="font-medium  text-sm sm:text-base">{selectedTeam.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Current score: {selectedTeam.score}</p>
                </div>
              </motion.div>
            ) : (
              <p className="mb-3 sm:mb-4 text-gray-500 italic text-sm sm:text-base">Please select a team first</p>
            )}
            
            {/* Improved display for the points input with animation */}
            <motion.div 
              className={`p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-right ${
                isDeduction ? "bg-amber-100" : "bg-gray-100"
              }`}
              animate={{ 
                scale: points && points !== '0' ? [1, 1.02, 1] : 1,
                transition: { duration: 0.3 } 
              }}
            >
              <span className={`text-2xl sm:text-3xl font-bold ${
                isDeduction ? "text-amber-600" : "text-gray-800"
              }`}>{isDeduction ? "-" : ""}{points || '0'}</span>
            </motion.div>
            
            {/* Better sized numpad buttons with animations for all screen sizes */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'delete', 0, 'clear'].map((num, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, backgroundColor: typeof num === 'number' || parseInt(num) === 0 ? '#f5f5f5' : undefined }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className={`w-full h-12 sm:h-14 md:h-16 text-lg sm:text-xl font-bold ${
                      typeof num === 'number' || parseInt(num) === 0 ? 'bg-white' : 
                      num === 'delete' ? 'bg-amber-100' : 'bg-red-100'
                    }`}
                    onClick={() => handleNumpadClick(String(num))}
                  >
                    {num === 'delete' ? '⌫' : num === 'clear' ? 'C' : num}
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {/* Animated submit button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 sm:mt-6"
            >
              <Button 
                className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold" 
                color={isDeduction ? "warning" : "primary"}
                disabled={!selectedTeam || !points || submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  isDeduction ? "Deduct Points" : "Submit Points"
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}