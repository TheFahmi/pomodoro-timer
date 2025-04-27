// Timer mode types
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

// Task category and tag types
export type TaskCategory = {
  id: string;
  name: string;
  color: string;
  icon?: string;
};

export type TaskTag = {
  id: string;
  name: string;
  color: string;
};

// Task type with categories and tags
export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category?: string; // References TaskCategory id
  tags: string[]; // Array of TaskTag ids
  estimatedPomodoros?: number;
  completedPomodoros: number;
  createdAt: Date;
  completedAt?: Date;
  priority?: 'low' | 'medium' | 'high';
};

// Time blocking types
export type TimeBlock = {
  id: string;
  startTime: Date;
  endTime: Date;
  taskId?: string; // References Task id
  title?: string; // Used for blocks without tasks
  description?: string;
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
};

export type RecurrencePattern = {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  endDate?: Date;
  occurrences?: number;
};

// Pomodoro technique variations
export type PomodoroTechnique = {
  id: string;
  name: string;
  description: string;
  pomodoroLength: number; // in minutes
  shortBreakLength: number; // in minutes
  longBreakLength: number; // in minutes
  longBreakInterval: number; // after how many pomodoros
  isDefault?: boolean;
};

// Timer settings
export type TimerSettings = {
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  currentTechnique: string; // References PomodoroTechnique id
  notificationSound: string;
  notificationVolume: number;
  tickingSound?: string;
  tickingVolume?: number;
};

// User preferences
export type UserPreferences = {
  theme: string;
  timerDesign: string;
  showSecondsInTimer: boolean;
  showMotivationalQuotes: boolean;
  enableFocusMode: boolean;
  enableDoNotDisturb: boolean;
  enableBackgroundMusic: boolean;
  backgroundMusicVolume: number;
  backgroundMusicTrack?: string;
};
