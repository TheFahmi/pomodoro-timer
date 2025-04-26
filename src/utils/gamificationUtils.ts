import { Achievement } from '../components/Achievements';
import { GamificationData } from '../components/Gamification';
import { Task } from '../components/TaskList';
import { SessionHistory } from '../components/PomodoroApp';

// Define default achievements
export const defaultAchievements: Achievement[] = [
  {
    id: 'first_pomodoro',
    title: 'First Focus',
    description: 'Complete your first pomodoro session',
    icon: '🍅',
    unlocked: false,
    requirement: {
      type: 'pomodoros',
      count: 1
    }
  },
  {
    id: 'pomodoro_5',
    title: 'Focus Apprentice',
    description: 'Complete 5 pomodoro sessions',
    icon: '⏱️',
    unlocked: false,
    requirement: {
      type: 'pomodoros',
      count: 5
    }
  },
  {
    id: 'pomodoro_25',
    title: 'Focus Master',
    description: 'Complete 25 pomodoro sessions',
    icon: '🧠',
    unlocked: false,
    requirement: {
      type: 'pomodoros',
      count: 25
    }
  },
  {
    id: 'pomodoro_100',
    title: 'Focus Grandmaster',
    description: 'Complete 100 pomodoro sessions',
    icon: '🏆',
    unlocked: false,
    requirement: {
      type: 'pomodoros',
      count: 100
    }
  },
  {
    id: 'first_task',
    title: 'Task Starter',
    description: 'Complete your first task',
    icon: '✅',
    unlocked: false,
    requirement: {
      type: 'tasks',
      count: 1
    }
  },
  {
    id: 'task_10',
    title: 'Task Manager',
    description: 'Complete 10 tasks',
    icon: '📋',
    unlocked: false,
    requirement: {
      type: 'tasks',
      count: 10
    }
  },
  {
    id: 'task_50',
    title: 'Productivity Pro',
    description: 'Complete 50 tasks',
    icon: '🚀',
    unlocked: false,
    requirement: {
      type: 'tasks',
      count: 50
    }
  },
  {
    id: 'streak_3',
    title: 'Consistency Beginner',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    unlocked: false,
    requirement: {
      type: 'streak',
      count: 3
    }
  },
  {
    id: 'streak_7',
    title: 'Consistency Pro',
    description: 'Maintain a 7-day streak',
    icon: '🔥🔥',
    unlocked: false,
    requirement: {
      type: 'streak',
      count: 7
    }
  },
  {
    id: 'streak_30',
    title: 'Consistency Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥🔥🔥',
    unlocked: false,
    requirement: {
      type: 'streak',
      count: 30
    }
  },
  {
    id: 'focus_1h',
    title: 'Focus Beginner',
    description: 'Focus for a total of 1 hour',
    icon: '⏰',
    unlocked: false,
    requirement: {
      type: 'focus_time',
      count: 3600
    }
  },
  {
    id: 'focus_10h',
    title: 'Focus Enthusiast',
    description: 'Focus for a total of 10 hours',
    icon: '⏰⏰',
    unlocked: false,
    requirement: {
      type: 'focus_time',
      count: 36000
    }
  },
  {
    id: 'focus_50h',
    title: 'Focus Expert',
    description: 'Focus for a total of 50 hours',
    icon: '⏰⏰⏰',
    unlocked: false,
    requirement: {
      type: 'focus_time',
      count: 180000
    }
  }
];

// Default gamification data
export const defaultGamificationData: GamificationData = {
  points: 0,
  level: 1,
  streak: 0,
  totalFocusTime: 0,
  totalCompletedPomodoros: 0,
  totalCompletedTasks: 0,
  achievements: defaultAchievements
};

// Calculate XP needed for next level (increases with each level)
export const getNextLevelXP = (level: number) => 100 * Math.pow(1.5, level - 1);

// Award points for completing a pomodoro
export const awardPomodoroPoints = (data: GamificationData, pomodoroTime: number): GamificationData => {
  // Base points for completing a pomodoro
  const basePoints = 10;
  
  // Bonus points based on pomodoro duration (longer pomodoros give more points)
  const durationBonus = Math.floor(pomodoroTime / 60) * 0.5;
  
  // Streak bonus (5% extra per day of streak, up to 50%)
  const streakMultiplier = Math.min(1.5, 1 + (data.streak * 0.05));
  
  // Calculate total points
  const pointsEarned = Math.floor((basePoints + durationBonus) * streakMultiplier);
  
  // Update total points
  const newPoints = data.points + pointsEarned;
  
  // Check if level up occurred
  let newLevel = data.level;
  let leveledUp = false;
  
  while (newPoints >= getNextLevelXP(newLevel) + (newLevel > 1 ? getNextLevelXP(newLevel - 1) : 0)) {
    newLevel++;
    leveledUp = true;
  }
  
  // Update total focus time and completed pomodoros
  const newTotalFocusTime = data.totalFocusTime + pomodoroTime;
  const newTotalCompletedPomodoros = data.totalCompletedPomodoros + 1;
  
  return {
    ...data,
    points: newPoints,
    level: newLevel,
    totalFocusTime: newTotalFocusTime,
    totalCompletedPomodoros: newTotalCompletedPomodoros,
    leveledUp
  };
};

// Award points for completing a task
export const awardTaskPoints = (data: GamificationData): GamificationData => {
  // Base points for completing a task
  const basePoints = 20;
  
  // Streak bonus (5% extra per day of streak, up to 50%)
  const streakMultiplier = Math.min(1.5, 1 + (data.streak * 0.05));
  
  // Calculate total points
  const pointsEarned = Math.floor(basePoints * streakMultiplier);
  
  // Update total points
  const newPoints = data.points + pointsEarned;
  
  // Check if level up occurred
  let newLevel = data.level;
  let leveledUp = false;
  
  while (newPoints >= getNextLevelXP(newLevel) + (newLevel > 1 ? getNextLevelXP(newLevel - 1) : 0)) {
    newLevel++;
    leveledUp = true;
  }
  
  // Update total completed tasks
  const newTotalCompletedTasks = data.totalCompletedTasks + 1;
  
  return {
    ...data,
    points: newPoints,
    level: newLevel,
    totalCompletedTasks: newTotalCompletedTasks,
    leveledUp
  };
};

// Update streak based on activity
export const updateStreak = (data: GamificationData): GamificationData => {
  const today = new Date().toLocaleDateString();
  
  // If no last active date, set it to today and start streak at 1
  if (!data.lastActiveDate) {
    return {
      ...data,
      streak: 1,
      lastActiveDate: today
    };
  }
  
  // If already active today, no change
  if (data.lastActiveDate === today) {
    return data;
  }
  
  // Check if last active date was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toLocaleDateString();
  
  if (data.lastActiveDate === yesterdayString) {
    // Streak continues
    return {
      ...data,
      streak: data.streak + 1,
      lastActiveDate: today
    };
  } else {
    // Streak broken, start new streak
    return {
      ...data,
      streak: 1,
      lastActiveDate: today
    };
  }
};

// Check and unlock achievements
export const checkAchievements = (
  data: GamificationData, 
  completedPomodoros: number, 
  completedTasks: number,
  focusTime: number
): GamificationData => {
  const updatedAchievements = data.achievements.map(achievement => {
    // Skip already unlocked achievements
    if (achievement.unlocked) {
      return achievement;
    }
    
    let unlocked = false;
    
    // Check requirements
    switch (achievement.requirement.type) {
      case 'pomodoros':
        unlocked = completedPomodoros >= achievement.requirement.count;
        break;
      case 'tasks':
        unlocked = completedTasks >= achievement.requirement.count;
        break;
      case 'streak':
        unlocked = data.streak >= achievement.requirement.count;
        break;
      case 'focus_time':
        unlocked = focusTime >= achievement.requirement.count;
        break;
    }
    
    if (unlocked) {
      return {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date()
      };
    }
    
    return achievement;
  });
  
  return {
    ...data,
    achievements: updatedAchievements
  };
};

// Process completed pomodoro
export const processCompletedPomodoro = (
  data: GamificationData, 
  pomodoroTime: number,
  completedPomodoros: number,
  completedTasks: number,
  focusTime: number
): GamificationData => {
  // Update streak
  let updatedData = updateStreak(data);
  
  // Award points
  updatedData = awardPomodoroPoints(updatedData, pomodoroTime);
  
  // Check achievements
  updatedData = checkAchievements(
    updatedData, 
    completedPomodoros, 
    completedTasks,
    focusTime
  );
  
  return updatedData;
};

// Process completed task
export const processCompletedTask = (
  data: GamificationData,
  completedPomodoros: number,
  completedTasks: number,
  focusTime: number
): GamificationData => {
  // Update streak
  let updatedData = updateStreak(data);
  
  // Award points
  updatedData = awardTaskPoints(updatedData);
  
  // Check achievements
  updatedData = checkAchievements(
    updatedData, 
    completedPomodoros, 
    completedTasks,
    focusTime
  );
  
  return updatedData;
};

// Calculate total focus time from session history
export const calculateTotalFocusTime = (
  sessionHistory: SessionHistory[],
  pomodoroTime: number
): number => {
  return sessionHistory
    .filter(session => session.type === 'pomodoro' && session.completed)
    .reduce((total, _) => total + pomodoroTime, 0);
};

// Calculate total completed tasks
export const calculateCompletedTasks = (tasks: Task[]): number => {
  return tasks.filter(task => task.completed).length;
};
