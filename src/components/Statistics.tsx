"use client";

import { useState, useEffect } from 'react';
import { TimerType } from './PomodoroApp';

// Define types for statistics
export type DailyStats = {
  date: string;
  completedPomodoros: number;
  totalFocusTime: number; // in seconds
  completedTasks: number;
};

export type SessionData = {
  type: TimerType;
  task: string;
  completed: boolean;
  timestamp: Date;
};

type StatisticsProps = {
  isOpen: boolean;
  onClose: () => void;
  sessionHistory: SessionData[];
  completedPomodoros: number;
  pomodoroTime: number; // in seconds
};

export default function Statistics({ isOpen, onClose, sessionHistory, completedPomodoros, pomodoroTime }: StatisticsProps) {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Calculate statistics when session history changes
  useEffect(() => {
    if (!sessionHistory.length) return;

    // Group sessions by date
    const statsByDate = new Map<string, DailyStats>();

    sessionHistory.forEach(session => {
      const date = new Date(session.timestamp).toLocaleDateString();

      if (!statsByDate.has(date)) {
        statsByDate.set(date, {
          date,
          completedPomodoros: 0,
          totalFocusTime: 0,
          completedTasks: 0,
        });
      }

      const stats = statsByDate.get(date)!;

      if (session.type === 'pomodoro' && session.completed) {
        stats.completedPomodoros += 1;
        stats.totalFocusTime += pomodoroTime;

        // Count unique completed tasks
        if (session.task && !session.task.trim().startsWith('_counted_')) {
          stats.completedTasks += 1;
          // Mark this task as counted to avoid double counting
          session.task = `_counted_${session.task}`;
        }
      }
    });

    // Convert map to array and sort by date (newest first)
    const statsArray = Array.from(statsByDate.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setDailyStats(statsArray);
  }, [sessionHistory, pomodoroTime]);

  if (!isOpen) return null;

  // Format time (seconds) to hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get data for current view
  const getViewData = () => {
    switch (currentView) {
      case 'daily':
        return dailyStats.slice(0, 7); // Last 7 days
      case 'weekly':
        // Group by week (simplified)
        return dailyStats.slice(0, 14);
      case 'monthly':
        // Group by month (simplified)
        return dailyStats.slice(0, 30);
      default:
        return dailyStats.slice(0, 7);
    }
  };

  const viewData = getViewData();

  // Calculate totals
  const totalPomodoros = dailyStats.reduce((sum, day) => sum + day.completedPomodoros, 0);
  const totalFocusTime = dailyStats.reduce((sum, day) => sum + day.totalFocusTime, 0);
  const totalCompletedTasks = dailyStats.reduce((sum, day) => sum + day.completedTasks, 0);

  // Calculate averages
  const daysWithActivity = dailyStats.length;
  const avgPomodorosPerDay = daysWithActivity ? (totalPomodoros / daysWithActivity).toFixed(1) : '0';
  const avgFocusTimePerDay = daysWithActivity ? formatTime(Math.round(totalFocusTime / daysWithActivity)) : '0h 0m';

  // Find the most productive day
  const mostProductiveDay = dailyStats.length
    ? dailyStats.reduce((max, day) => day.completedPomodoros > max.completedPomodoros ? day : max, dailyStats[0])
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Productivity Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-base font-semibold mb-1">Total Focus Sessions</h3>
            <p className="text-2xl font-bold">{totalPomodoros}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg: {avgPomodorosPerDay} per day</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-base font-semibold mb-1">Total Focus Time</h3>
            <p className="text-2xl font-bold">{formatTime(totalFocusTime)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg: {avgFocusTimePerDay} per day</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-base font-semibold mb-1">Tasks Completed</h3>
            <p className="text-2xl font-bold">{totalCompletedTasks}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {mostProductiveDay ? `Most productive: ${mostProductiveDay.date}` : 'No data yet'}
            </p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setCurrentView('daily')}
            className={`px-4 py-2 rounded-md cursor-pointer ${
              currentView === 'daily'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setCurrentView('weekly')}
            className={`px-4 py-2 rounded-md cursor-pointer ${
              currentView === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setCurrentView('monthly')}
            className={`px-4 py-2 rounded-md cursor-pointer ${
              currentView === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Data Visualization */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Focus Sessions by Day</h3>
          <div className="h-60 flex items-end space-x-2">
            {viewData.length > 0 ? (
              viewData.map((day, index) => {
                // Find the max value for scaling
                const maxPomodoros = Math.max(...viewData.map(d => d.completedPomodoros), 1);
                const heightPercentage = (day.completedPomodoros / maxPomodoros) * 100;

                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-400 truncate w-full text-center">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className="text-xs font-semibold">{day.completedPomodoros}</div>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center text-gray-500">
                No data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Detailed Statistics</h3>
          {dailyStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Focus Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Focus Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {dailyStats.map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{day.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{day.completedPomodoros}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatTime(day.totalFocusTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{day.completedTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No statistics available yet. Complete some focus sessions to see your progress!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
