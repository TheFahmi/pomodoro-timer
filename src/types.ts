// Timer mode types
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

// Task type
export type TaskType = {
  id: string;
  title: string;
  completed: boolean;
  pomodoros: number;
  completedPomodoros: number;
  createdAt: Date;
  updatedAt: Date;
};
