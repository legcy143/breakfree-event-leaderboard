"use client"
import { assets } from '@/assets/assets'
import { Button } from '@heroui/react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Team } from '@/data/teams'
import { useTeams } from '../provider'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPage() {
  const { teams, updateTeamScore, addNewTeam, deleteTeam, updateTeam, isLoading, lastUpdated } = useTeams()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [points, setPoints] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isDeduction, setIsDeduction] = useState<boolean>(false)
  
  // New team form state
  const [newTeamName, setNewTeamName] = useState<string>('')
  const [newTeamCompany, setNewTeamCompany] = useState<string>('')
  const [newTeamScore, setNewTeamScore] = useState<string>('0')
  const [activeTab, setActiveTab] = useState<'update' | 'add' | 'manage'>('update')
  
  // Edit team state
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [editTeamName, setEditTeamName] = useState<string>('')
  const [editTeamCompany, setEditTeamCompany] = useState<string>('')
  const [editTeamScore, setEditTeamScore] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

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
  
  // Function to handle adding a new team
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTeamName || !newTeamCompany || submitting) return
    
    try {
      setSubmitting(true)
      
      // Call the addNewTeam function from context
      const result = await addNewTeam(newTeamName, newTeamCompany, newTeamScore || '0')
      
      if (result) {
        // Set success message
        setSuccessMessage(`Team "${newTeamName}" created successfully`)
        
        // Show success message
        setShowSuccess(true)
        
        // Reset form
        setNewTeamName('')
        setNewTeamCompany('')
        setNewTeamScore('0')
        
        // Reset after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
          setSubmitting(false)
          setSuccessMessage('')
        }, 3000)
      } else {
        console.error('Failed to create team')
        setSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating team:', error)
      setSubmitting(false)
    }
  }

  // Function to start editing a team
  const startEditTeam = (team: Team) => {
    setTeamToEdit(team);
    setEditTeamName(team.name);
    setEditTeamCompany(team.companyName || '');
    setEditTeamScore(team.score);
  };

  // Function to cancel editing
  const cancelEditTeam = () => {
    setTeamToEdit(null);
    setEditTeamName('');
    setEditTeamCompany('');
    setEditTeamScore('');
  };

  // Function to handle saving team edits
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamToEdit?.id || !editTeamName || submitting) return;
    
    try {
      setSubmitting(true);
      
      // Call the updateTeam function from context
      const result = await updateTeam(
        teamToEdit.id,
        editTeamName,
        editTeamCompany,
        editTeamScore
      );
      
      if (result) {
        // Set success message
        setSuccessMessage(`Team "${editTeamName}" updated successfully`);
        
        // Show success message
        setShowSuccess(true);
        
        // Reset form
        cancelEditTeam();
        
        // Reset after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setSubmitting(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('Failed to update team');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      setSubmitting(false);
    }
  };

  // Function to handle team deletion
  const handleDeleteTeam = async (teamId: string) => {
    if (!teamId || submitting) return;
    
    try {
      setSubmitting(true);
      
      // Call the deleteTeam function from context
      const result = await deleteTeam(teamId);
      
      if (result) {
        // If the selected team is being deleted, clear the selection
        if (selectedTeam && (selectedTeam.id === teamId)) {
          setSelectedTeam(null);
        }
        
        // Set success message
        setSuccessMessage('Team deleted successfully');
        
        // Show success message
        setShowSuccess(true);
        
        // Close confirmation dialog
        setShowDeleteConfirm(null);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setSubmitting(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('Failed to delete team');
        setSubmitting(false);
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setSubmitting(false);
      setShowDeleteConfirm(null);
    }
  };

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

        {/* Tabs for switching between update, add, and manage modes */}
        <div className="flex mb-4 border-b border-gray-200 flex-wrap">
          <button 
            onClick={() => setActiveTab('update')}
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'update' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-brand'}`}
          >
            Update Scores
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'add' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-brand'}`}
          >
            Add New Team
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'manage' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-brand'}`}
          >
            Manage Teams
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'update' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Team Selection Section - improved padding and grid responsiveness */}
            <div className="bg-white/90 rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-brand mb-3 sm:mb-4">1. Select Team</h2>              
              {/* Responsive grid that adapts to different screen sizes */}
              <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {teams.map((team) => (
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand/20 flex items-center justify-center mb-2">
                      <span className="text-brand font-bold text-lg">{team.name.charAt(0)}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-center text-brand line-clamp-2 min-h-[2.5em]">{team.name}</p>
                    <div className="text-xs text-gray-500">{team.companyName}</div>
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
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                    <span className="text-brand font-bold">{selectedTeam.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-brand text-sm sm:text-base">{selectedTeam.name}</p>
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
        ) : activeTab === 'add' ? (
          // Add New Team Form
          <div className="bg-white/90 rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand mb-3 sm:mb-4">Add New Team</h2>
            
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand"
                  placeholder="Enter team name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={newTeamCompany}
                  onChange={(e) => setNewTeamCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand"
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="initialScore" className="block text-sm font-medium text-gray-700">
                  Initial Score
                </label>
                <input
                  type="number"
                  id="initialScore"
                  value={newTeamScore}
                  onChange={(e) => setNewTeamScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="pt-4">
                <Button
                  color="primary"
                  type="submit"
                  disabled={submitting || !newTeamName || !newTeamCompany}
                  className="w-full justify-center py-3"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Manage Teams: List all teams with edit and delete options
          <div className="bg-white/90 rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand mb-3 sm:mb-4">Manage Teams</h2>
            
            {/* List of teams */}
            <div className="overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.id || team.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center">
                            <span className="text-brand font-medium">{team.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{team.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{team.score}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          color="primary"
                          onClick={() => startEditTeam(team)}
                          className="mr-2"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          color="danger"
                          onClick={() => setShowDeleteConfirm(team.id)}
                          size="sm"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Edit Team Form (shown when a team is selected for editing) */}
            {teamToEdit && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border p-4 rounded-lg mb-6 bg-gray-50"
              >
                <h3 className="text-lg font-bold mb-4">Edit Team: {teamToEdit.name}</h3>
                <form onSubmit={handleSaveTeam} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="editTeamName" className="block text-sm font-medium text-gray-700">
                      Team Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editTeamName"
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand"
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="editCompanyName" className="block text-sm font-medium text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editCompanyName"
                      value={editTeamCompany}
                      onChange={(e) => setEditTeamCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="editScore" className="block text-sm font-medium text-gray-700">
                      Score
                    </label>
                    <input
                      type="number"
                      id="editScore"
                      value={editTeamScore}
                      onChange={(e) => setEditTeamScore(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      color="default"
                      onClick={cancelEditTeam}
                      type="button"
                      className="py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      type="submit"
                      disabled={submitting || !editTeamName || !editTeamCompany}
                      className="py-2"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg max-w-md w-full mx-4 p-6"
                >
                  <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
                  <p className="mb-4">Are you sure you want to delete this team? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <Button
                      color="default"
                      onClick={() => setShowDeleteConfirm(null)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      onClick={() => handleDeleteTeam(showDeleteConfirm)}
                      disabled={submitting}
                    >
                      {submitting ? "Deleting..." : "Delete Team"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
