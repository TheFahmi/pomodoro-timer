import { Habit } from '@/components/HabitTracker';

// Save habits to local storage
export const saveHabits = (habits: Habit[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pomodoro-habits', JSON.stringify(habits));
  }
};

// Load habits from local storage
export const loadHabits = (): Habit[] => {
  if (typeof window !== 'undefined') {
    const savedHabits = localStorage.getItem('pomodoro-habits');
    if (savedHabits) {
      try {
        return JSON.parse(savedHabits);
      } catch (error) {
        console.error('Error parsing saved habits:', error);
      }
    }
  }
  return [];
};

// Add a new habit
export const addHabit = (
  habits: Habit[], 
  habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'longestStreak'>
): Habit[] => {
  const newHabit: Habit = {
    id: `habit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
    ...habit
  };
  
  const updatedHabits = [...habits, newHabit];
  saveHabits(updatedHabits);
  return updatedHabits;
};

// Complete a habit for a specific date
export const completeHabit = (habits: Habit[], habitId: string, date: string): Habit[] => {
  const updatedHabits = habits.map(habit => {
    if (habit.id === habitId) {
      const isAlreadyCompleted = habit.completedDates.includes(date);
      let completedDates = [...habit.completedDates];
      
      // If already completed, remove the date; otherwise add it
      if (isAlreadyCompleted) {
        completedDates = completedDates.filter(d => d !== date);
      } else {
        completedDates.push(date);
      }
      
      // Sort dates in ascending order
      completedDates.sort();
      
      // Calculate streaks
      const { currentStreak, longestStreak } = calculateStreaks(completedDates);
      
      return {
        ...habit,
        completedDates,
        currentStreak,
        longestStreak,
      };
    }
    return habit;
  });
  
  saveHabits(updatedHabits);
  return updatedHabits;
};

// Delete a habit
export const deleteHabit = (habits: Habit[], habitId: string): Habit[] => {
  const updatedHabits = habits.filter(habit => habit.id !== habitId);
  saveHabits(updatedHabits);
  return updatedHabits;
};

// Calculate the current streak and longest streak for a habit
const calculateStreaks = (completedDates: string[]): { currentStreak: number, longestStreak: number } => {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Sort dates if not already sorted
  const sortedDates = [...completedDates].sort();
  
  // Check current streak (consecutive days leading up to today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  
  // Calculate both streaks in one pass
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    currentDate.setHours(0, 0, 0, 0);
    
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      // Check if consecutive
      const diffTime = currentDate.getTime() - lastDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        // Consecutive day
        tempStreak++;
      } else if (diffDays === 0) {
        // Same day, ignore
        continue;
      } else {
        // Streak broken
        tempStreak = 1;
      }
    }
    
    // Update longest streak
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Check if this is part of the current active streak
    // (ends today or yesterday)
    if (currentDate.getTime() === today.getTime() || 
        currentDate.getTime() === yesterday.getTime()) {
      currentStreak = tempStreak;
    }
    
    lastDate = currentDate;
  }
  
  return { currentStreak, longestStreak };
};