import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SessionHistory, TimerType } from './PomodoroApp';

interface ProgressTimelineProps {
  sessionHistory: SessionHistory[];
  currentTimer: TimerType;
  isActive: boolean;
  timeLeft: number;
  pomodoroTime: number;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  sessionHistory,
  currentTimer,
  isActive,
  timeLeft,
  pomodoroTime,
}) => {
  const [todaySessions, setTodaySessions] = useState<SessionHistory[]>([]);
  
  // Filter session history to only include today's sessions
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredSessions = sessionHistory.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= today;
    });
    
    setTodaySessions(filteredSessions);
  }, [sessionHistory]);

  // Calculate the percentage of the current timer that has elapsed
  const currentProgress = currentTimer === 'pomodoro' && isActive
    ? (1 - timeLeft / pomodoroTime) * 100
    : 0;

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Today&apos;s Progress</h3>
      
      <div className="flex items-center mb-3">
        <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
          {todaySessions.filter(s => s.type === 'pomodoro' && s.completed).length} completed sessions
        </span>
        <span className="flex-grow"></span>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300 mr-3">Completed</span>
          
          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300 mr-3">Break</span>
          
          <div className="w-4 h-4 bg-red-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">Incomplete</span>
        </div>
      </div>
      
      <div className="relative h-10 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
        {/* Timeline markers */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="flex-grow border-r border-gray-300 dark:border-gray-600 h-full"
              style={{ borderWidth: i === 11 ? 0 : 1 }}
            />
          ))}
        </div>
        
        {/* Session blocks */}
        {todaySessions.map((session, index) => {
          // Calculate position based on time of day (0-24h)
          const sessionTime = new Date(session.timestamp);
          const hours = sessionTime.getHours() + (sessionTime.getMinutes() / 60);
          const positionPercent = (hours / 24) * 100;
          
          // Determine width based on session type
          let width = 2; // Default width
          let bgColor = 'bg-green-500'; // Default color for completed pomodoros
          
          if (session.type === 'pomodoro') {
            width = 2.5;
            bgColor = session.completed ? 'bg-green-500' : 'bg-red-500';
          } else {
            width = 1.5;
            bgColor = 'bg-yellow-500'; // Breaks
          }
          
          return (
            <motion.div
              key={index}
              className={`absolute top-0 h-full ${bgColor}`}
              style={{
                left: `${positionPercent}%`,
                width: `${width}%`,
                opacity: 0.8,
              }}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            />
          );
        })}
        
        {/* Current session indicator (only shown during active pomodoro) */}
        {currentTimer === 'pomodoro' && isActive && (
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500" style={{ width: `${currentProgress}%` }} />
        )}
        
        {/* Current time indicator */}
        <div 
          className="absolute top-0 h-full border-l-2 border-blue-500"
          style={{ 
            left: `${(new Date().getHours() + new Date().getMinutes() / 60) / 24 * 100}%`,
            zIndex: 10 
          }}
        >
          <div className="absolute -top-6 -ml-3 text-xs text-blue-500 font-semibold">
            {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>12AM</span>
      </div>
    </div>
  );
};

export default ProgressTimeline;