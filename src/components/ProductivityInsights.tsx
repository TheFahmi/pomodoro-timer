"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SessionHistory } from './PomodoroApp';
import { Task } from './TaskList';

interface ProductivityInsightsProps {
  sessionHistory: SessionHistory[];
  tasks: Task[];
  totalPomodorosCompleted: number;
  isOpen: boolean;
  onClose: () => void;
}

const ProductivityInsights = ({
  sessionHistory,
  tasks,
  totalPomodorosCompleted,
  isOpen,
  onClose
}: ProductivityInsightsProps) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  // Helper function to calculate current streak
  const calculateCurrentStreak = (sessions: SessionHistory[]): number => {
    if (sessions.length === 0) return 0;
    
    // Create array of dates with at least one completed pomodoro
    const datesWithCompletedPomodoros = sessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .map(s => {
        const date = new Date(s.timestamp);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
      .filter((value, index, self) => self.indexOf(value) === index) // Unique dates
      .sort((a, b) => a.localeCompare(b));
    
    if (datesWithCompletedPomodoros.length === 0) return 0;
    
    // Check if today has a completed pomodoro
    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    if (datesWithCompletedPomodoros[datesWithCompletedPomodoros.length - 1] !== todayString) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
      
      if (datesWithCompletedPomodoros[datesWithCompletedPomodoros.length - 1] !== yesterdayString) {
        return 0; // Streak broken
      }
    }
    
    // Count consecutive days backwards
    let streak = 1;
    for (let i = datesWithCompletedPomodoros.length - 2; i >= 0; i--) {
      const currentDate = new Date(datesWithCompletedPomodoros[i]);
      const nextDate = new Date(datesWithCompletedPomodoros[i + 1]);
      
      const diffTime = Math.abs(nextDate.getTime() - currentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Helper function to calculate longest streak
  const calculateLongestStreak = (sessions: SessionHistory[]): number => {
    if (sessions.length === 0) return 0;
    
    // Create array of dates with at least one completed pomodoro
    const datesWithCompletedPomodoros = sessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .map(s => {
        const date = new Date(s.timestamp);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
      .filter((value, index, self) => self.indexOf(value) === index) // Unique dates
      .sort((a, b) => a.localeCompare(b));
    
    if (datesWithCompletedPomodoros.length === 0) return 0;
    
    // Find longest consecutive sequence
    let currentStreak = 1;
    let longestStreak = 1;
    
    for (let i = 1; i < datesWithCompletedPomodoros.length; i++) {
      const currentDate = new Date(datesWithCompletedPomodoros[i]);
      const prevDate = new Date(datesWithCompletedPomodoros[i - 1]);
      
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  };

  // Calculate data for insights
  const insightsData = useMemo(() => {
    // Get current date for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter sessions by time period
    const dailySessions = sessionHistory.filter(s => 
      new Date(s.timestamp).getTime() >= today.getTime()
    );
    
    const weeklySessions = sessionHistory.filter(s => 
      new Date(s.timestamp).getTime() >= weekStart.getTime()
    );
    
    const monthlySessions = sessionHistory.filter(s => 
      new Date(s.timestamp).getTime() >= monthStart.getTime()
    );

    // Calculate focus time for each period (in minutes)
    const dailyFocusMinutes = dailySessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .length * 25;
    
    const weeklyFocusMinutes = weeklySessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .length * 25;
    
    const monthlyFocusMinutes = monthlySessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .length * 25;

    // Count completed tasks for each period
    const dailyCompletedTasks = tasks.filter(t => 
      t.completed && t.updatedAt && 
      new Date(t.updatedAt).getTime() >= today.getTime()
    ).length;
    
    const weeklyCompletedTasks = tasks.filter(t => 
      t.completed && t.updatedAt && 
      new Date(t.updatedAt).getTime() >= weekStart.getTime()
    ).length;
    
    const monthlyCompletedTasks = tasks.filter(t => 
      t.completed && t.updatedAt && 
      new Date(t.updatedAt).getTime() >= monthStart.getTime()
    ).length;

    // Calculate most productive day of week
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    sessionHistory.forEach(s => {
      if (s.type === 'pomodoro' && s.completed) {
        const day = new Date(s.timestamp).getDay();
        dayCount[day]++;
      }
    });

    const mostProductiveDay = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
      'Thursday', 'Friday', 'Saturday'
    ][dayCount.indexOf(Math.max(...dayCount))];

    // Calculate most productive hour
    const hourCount = Array(24).fill(0);
    sessionHistory.forEach(s => {
      if (s.type === 'pomodoro' && s.completed) {
        const hour = new Date(s.timestamp).getHours();
        hourCount[hour]++;
      }
    });

    const mostProductiveHour = hourCount.indexOf(Math.max(...hourCount));

    return {
      focusTime: {
        daily: dailyFocusMinutes,
        weekly: weeklyFocusMinutes,
        monthly: monthlyFocusMinutes
      },
      completedTasks: {
        daily: dailyCompletedTasks,
        weekly: weeklyCompletedTasks,
        monthly: monthlyCompletedTasks
      },
      patterns: {
        mostProductiveDay,
        mostProductiveHour,
      },
      streaks: {
        current: calculateCurrentStreak(sessionHistory),
        longest: calculateLongestStreak(sessionHistory)
      }
    };
  }, [sessionHistory, tasks]);

  // Render chart based on active tab and chart type
  const renderChart = () => {
    // Simplified placeholder for charts
    // In a real implementation, you would use a charting library like Chart.js, Recharts, or Nivo
    
    let dataToDisplay;
    if (activeTab === 'daily') {
      dataToDisplay = {
        focusTime: insightsData.focusTime.daily,
        completedTasks: insightsData.completedTasks.daily
      };
    } else if (activeTab === 'weekly') {
      dataToDisplay = {
        focusTime: insightsData.focusTime.weekly,
        completedTasks: insightsData.completedTasks.weekly
      };
    } else {
      dataToDisplay = {
        focusTime: insightsData.focusTime.monthly,
        completedTasks: insightsData.completedTasks.monthly
      };
    }

    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-44 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">
            {chartType === 'bar' && 'Bar Chart'}
            {chartType === 'line' && 'Line Chart'}
            {chartType === 'pie' && 'Pie Chart'}
          </p>
          <p className="mt-2">
            Focus time: {dataToDisplay.focusTime} minutes<br />
            Completed tasks: {dataToDisplay.completedTasks}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            (Visualization would appear here with a charting library)
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-xl w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: isOpen ? 0 : 50, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Productivity Insights</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Focus Time</h3>
              <p className="text-3xl font-bold mt-2">
                {activeTab === 'daily' && `${insightsData.focusTime.daily} min`}
                {activeTab === 'weekly' && `${insightsData.focusTime.weekly} min`}
                {activeTab === 'monthly' && `${insightsData.focusTime.monthly} min`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'daily' && 'Today'}
                {activeTab === 'weekly' && 'This week'}
                {activeTab === 'monthly' && 'This month'}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Completed Tasks</h3>
              <p className="text-3xl font-bold mt-2">
                {activeTab === 'daily' && insightsData.completedTasks.daily}
                {activeTab === 'weekly' && insightsData.completedTasks.weekly}
                {activeTab === 'monthly' && insightsData.completedTasks.monthly}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'daily' && 'Today'}
                {activeTab === 'weekly' && 'This week'}
                {activeTab === 'monthly' && 'This month'}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Streak</h3>
              <p className="text-3xl font-bold mt-2">{insightsData.streaks.current} days</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Longest: {insightsData.streaks.longest} days
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`py-2 px-4 ${
                  activeTab === 'daily'
                    ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('daily')}
              >
                Daily
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === 'weekly'
                    ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('weekly')}
              >
                Weekly
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === 'monthly'
                    ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </button>
              
              <div className="ml-auto">
                <select
                  className="py-1 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'pie')}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              {renderChart()}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Productivity Patterns</h3>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Most productive day:</span>
                  <span className="font-medium">{insightsData.patterns.mostProductiveDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Peak productivity time:</span>
                  <span className="font-medium">
                    {insightsData.patterns.mostProductiveHour === 0 ? '12 AM' : 
                     insightsData.patterns.mostProductiveHour < 12 ? `${insightsData.patterns.mostProductiveHour} AM` :
                     insightsData.patterns.mostProductiveHour === 12 ? '12 PM' : 
                     `${insightsData.patterns.mostProductiveHour - 12} PM`}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Total Stats</h3>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Pomodoros completed:</span>
                  <span className="font-medium">{totalPomodorosCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total focus time:</span>
                  <span className="font-medium">{totalPomodorosCompleted * 25} min</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductivityInsights;
