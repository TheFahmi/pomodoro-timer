"use client";

import { useState, useEffect } from 'react';

export type Habit = {
  id: string;
  name: string;
  description?: string;
  target: number; // target number of completions (e.g., 5 times per week)
  period: 'daily' | 'weekly' | 'monthly';
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  color?: string; // For custom habit color
};

type HabitTrackerProps = {
  onHabitAdd?: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'longestStreak'>) => void;
  onHabitComplete?: (habitId: string, date: string) => void;
  onHabitDelete?: (habitId: string) => void;
  habits?: Habit[];
};

export default function HabitTracker({
  onHabitAdd = () => {},
  onHabitComplete = () => {},
  onHabitDelete = () => {},
  habits = []
}: HabitTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    description: '',
    target: 1,
    period: 'daily',
    color: '#6366f1' // Default indigo color
  });
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Today's date in ISO format
  const today = new Date().toISOString().split('T')[0];

  // Calculate if a habit was completed today
  const isCompletedToday = (habit: Habit) => {
    return habit.completedDates.includes(today);
  };

  // Get progress percentage
  const getProgressPercentage = (habit: Habit) => {
    const now = new Date();
    const completedThisPeriod = getCompletedCountInCurrentPeriod(habit);
    return Math.min(100, Math.round((completedThisPeriod / habit.target) * 100));
  };

  // Get completed count in current period
  const getCompletedCountInCurrentPeriod = (habit: Habit) => {
    const now = new Date();
    let startDate = new Date();
    
    // Calculate period start based on habit period
    if (habit.period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (habit.period === 'weekly') {
      // Start from Monday of current week
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else if (habit.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Filter completions within this period
    return habit.completedDates.filter(date => {
      const completionDate = new Date(date);
      return completionDate >= startDate && completionDate <= now;
    }).length;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.name && newHabit.target && newHabit.period) {
      onHabitAdd({
        name: newHabit.name,
        description: newHabit.description || '',
        target: Number(newHabit.target),
        period: newHabit.period as 'daily' | 'weekly' | 'monthly',
        color: newHabit.color
      });
      setNewHabit({
        name: '',
        description: '',
        target: 1,
        period: 'daily',
        color: '#6366f1'
      });
      setShowAddForm(false);
    }
  };

  // Toggle habit completion
  const toggleHabitCompletion = (habit: Habit) => {
    if (isCompletedToday(habit)) {
      // Remove today's completion (if needed)
      // This would need additional implementation in the parent component
    } else {
      onHabitComplete(habit.id, today);
    }
  };

  return (
    <div className="space-y-4">
      {/* Habits List */}
      {habits.length > 0 ? (
        <div className="space-y-3">
          {habits.map(habit => (
            <div 
              key={habit.id} 
              className="relative bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    {habit.name}
                    {habit.currentStreak > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                        🔥 {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </h4>
                  {habit.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{habit.description}</p>
                  )}
                  
                  {/* Progress bar */}
                  <div className="mt-3 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${getProgressPercentage(habit)}%`,
                        backgroundColor: habit.color || '#6366f1'
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getCompletedCountInCurrentPeriod(habit)}/{habit.target} {habit.period}
                    </span>
                    {habit.longestStreak > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Best: 🔥 {habit.longestStreak} {habit.longestStreak === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleHabitCompletion(habit)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompletedToday(habit)
                        ? `bg-green-500 text-white hover:bg-green-600`
                        : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600`
                    }`}
                  >
                    {isCompletedToday(habit) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={() => onHabitDelete(habit.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">No habits added yet</p>
        </div>
      )}

      {/* Add Habit Form */}
      {showAddForm ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Habit</h4>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="habitName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Habit Name*
              </label>
              <input
                type="text"
                id="habitName"
                value={newHabit.name}
                onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="e.g., Meditate, Exercise, Read"
                required
              />
            </div>
            
            <div>
              <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                id="habitDescription"
                value={newHabit.description}
                onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="e.g., 10 minutes of meditation"
              />
            </div>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <label htmlFor="habitTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target*
                </label>
                <input
                  type="number"
                  id="habitTarget"
                  min={1}
                  value={newHabit.target}
                  onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="habitPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period*
                </label>
                <select
                  id="habitPeriod"
                  value={newHabit.period}
                  onChange={(e) => setNewHabit({...newHabit, period: e.target.value as 'daily' | 'weekly' | 'monthly'})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="habitColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  id="habitColor"
                  value={newHabit.color}
                  onChange={(e) => setNewHabit({...newHabit, color: e.target.value})}
                  className="h-8 w-8 border-0 p-0 mr-2"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">Select a color for your habit</span>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-700 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Add Habit
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full px-4 py-3 flex items-center justify-center text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Habit
        </button>
      )}
    </div>
  );
}