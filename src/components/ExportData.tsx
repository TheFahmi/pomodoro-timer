"use client";

import { useState } from 'react';
import { SessionHistory } from './PomodoroApp';
import { Task } from './TaskList';
import { GamificationData } from './Gamification';
import { motion, AnimatePresence } from 'framer-motion';

type ExportDataProps = {
  sessionHistory: SessionHistory[];
  tasks: Task[];
  completedPomodoros: number;
  gamificationData: GamificationData;
};

// Format time in HH:MM:SS format
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format timestamp to readable date and time
const formatTimestamp = (timestamp: string | number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Format timestamp to time only (HH:MM)
const formatTimeOnly = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export default function ExportData({ sessionHistory, tasks, completedPomodoros, gamificationData }: ExportDataProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportOption, setExportOption] = useState<'all' | 'tasks' | 'sessions' | 'timeTracking'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const toggleExportModal = () => {
    setIsOpen(!isOpen);
    setExportSuccess(false);
    setExportError(null);
  };

  const handleExportFormatChange = (format: 'json' | 'csv' | 'excel') => {
    setExportFormat(format);
  };

  const exportData = () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      let filename = `pomodoro-data-${dateStr}`;
      let data: string;
      let mimeType: string;

      // Filter data based on date range
      let filteredTasks = [...tasks];
      let filteredSessionHistory = [...sessionHistory];

      if (dateRange !== 'all') {
        const cutoffDate = new Date();

        if (dateRange === 'today') {
          cutoffDate.setHours(0, 0, 0, 0);
        } else if (dateRange === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (dateRange === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        }

        filteredTasks = filteredTasks.filter(task =>
          new Date(task.updatedAt) >= cutoffDate
        );

        filteredSessionHistory = filteredSessionHistory.filter(session =>
          new Date(session.timestamp) >= cutoffDate
        );
      }

      // Prepare data object based on export option
      let exportObject: any = {
        exportDate: now.toISOString(),
        exportInfo: {
          dateRange,
          exportFormat,
          exportOption
        }
      };

      if (exportOption === 'all' || exportOption === 'tasks') {
        exportObject.tasks = filteredTasks;
      }

      if (exportOption === 'all' || exportOption === 'sessions') {
        exportObject.sessionHistory = filteredSessionHistory;
      }

      if (exportOption === 'all') {
        exportObject.stats = {
          totalPomodoros: completedPomodoros,
          totalFocusTime: gamificationData.totalFocusTime,
          totalCompletedTasks: gamificationData.totalCompletedTasks,
          level: gamificationData.level,
          points: gamificationData.points,
          streak: gamificationData.streak,
        };
        exportObject.achievements = gamificationData.achievements.filter(a => a.unlocked);
      }

      // Special handling for time tracking data
      if (exportOption === 'all' || exportOption === 'timeTracking') {
        const timeTrackingData = filteredTasks
          .filter(task => task.timeTracking && task.timeTracking.history && task.timeTracking.history.length > 0)
          .map(task => ({
            taskId: task.id,
            taskTitle: task.title,
            totalTrackedTime: task.timeTracking?.totalTime || 0,
            formattedTotalTime: formatTime(task.timeTracking?.totalTime || 0),
            isCurrentlyTracking: task.timeTracking?.isTracking || false,
            sessions: task.timeTracking?.history.map(session => ({
              start: session.start,
              end: session.end,
              duration: session.duration,
              formattedDuration: formatTime(session.duration),
              startTime: formatTimestamp(session.start),
              endTime: formatTimestamp(session.end),
              startTimeOnly: formatTimeOnly(session.start),
              endTimeOnly: formatTimeOnly(session.end),
              date: new Date(session.start).toLocaleDateString()
            })) || []
          }));

        exportObject.timeTracking = timeTrackingData;
      }

      if (exportFormat === 'json') {
        data = JSON.stringify(exportObject, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else if (exportFormat === 'csv') {
        // CSV export
        const csvRows = [];

        // Add export info
        csvRows.push('Pomodoro Timer Data Export');
        csvRows.push(`Export Date,${now.toLocaleString()}`);
        csvRows.push(`Date Range,${dateRange === 'all' ? 'All Time' : dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}`);
        csvRows.push('');

        if (exportOption === 'all' || exportOption === 'tasks') {
          // Header for tasks
          csvRows.push('TASKS');
          csvRows.push('ID,Title,Completed,Pomodoros,CompletedPomodoros,Updated At');

          // Tasks data
          filteredTasks.forEach(task => {
            csvRows.push(`${task.id},"${task.title.replace(/"/g, '""')}",${task.completed ? 'Yes' : 'No'},${task.pomodoros},${task.completedPomodoros},${new Date(task.updatedAt).toLocaleString()}`);
          });

          csvRows.push('');
        }

        if (exportOption === 'all' || exportOption === 'sessions') {
          // Header for session history
          csvRows.push('SESSION HISTORY');
          csvRows.push('Type,Task,Completed,Timestamp');

          // Session history data
          filteredSessionHistory.forEach(session => {
            csvRows.push(`${session.type},"${session.task.replace(/"/g, '""')}",${session.completed ? 'Yes' : 'No'},${new Date(session.timestamp).toLocaleString()}`);
          });

          csvRows.push('');
        }

        if (exportOption === 'all' || exportOption === 'timeTracking') {
          // Time tracking data
          csvRows.push('TIME TRACKING');
          csvRows.push('Task ID,Task Title,Total Time,Currently Tracking');

          const timeTrackingTasks = filteredTasks.filter(task =>
            task.timeTracking && task.timeTracking.history && task.timeTracking.history.length > 0
          );

          timeTrackingTasks.forEach(task => {
            csvRows.push(`${task.id},"${task.title.replace(/"/g, '""')}",${formatTime(task.timeTracking?.totalTime || 0)},${task.timeTracking?.isTracking ? 'Yes' : 'No'}`);
          });

          csvRows.push('');
          csvRows.push('TIME TRACKING SESSIONS');
          csvRows.push('Task ID,Task Title,Date,Start Time,End Time,Duration');

          timeTrackingTasks.forEach(task => {
            if (task.timeTracking?.history) {
              task.timeTracking.history.forEach(session => {
                const startDate = new Date(session.start);
                csvRows.push(
                  `${task.id},"${task.title.replace(/"/g, '""')}",${startDate.toLocaleDateString()},${formatTimeOnly(session.start)},${formatTimeOnly(session.end)},${formatTime(session.duration)}`
                );
              });
            }
          });

          csvRows.push('');
        }

        if (exportOption === 'all') {
          // Stats
          csvRows.push('STATISTICS');
          csvRows.push(`Total Pomodoros,${completedPomodoros}`);
          csvRows.push(`Total Focus Time,${formatTime(gamificationData.totalFocusTime * 1000)}`);
          csvRows.push(`Total Completed Tasks,${gamificationData.totalCompletedTasks}`);
          csvRows.push(`Level,${gamificationData.level}`);
          csvRows.push(`Points,${gamificationData.points}`);
          csvRows.push(`Streak,${gamificationData.streak}`);

          // Achievements
          if (gamificationData.achievements.filter(a => a.unlocked).length > 0) {
            csvRows.push('');
            csvRows.push('ACHIEVEMENTS');
            csvRows.push('Title,Description,Unlocked Date');

            gamificationData.achievements.filter(a => a.unlocked).forEach(achievement => {
              csvRows.push(`${achievement.title},"${achievement.description.replace(/"/g, '""')}",${achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleString() : 'N/A'}`);
            });
          }
        }

        // Join with newlines
        data = csvRows.join('\n');
        mimeType = 'text/csv';
        filename += '.csv';
      } else {
        // Excel-like export (actually CSV with Excel formatting)
        const excelRows = [];

        // Add export info with some styling
        excelRows.push('Pomodoro Timer Data Export');
        excelRows.push(`Export Date,${now.toLocaleString()}`);
        excelRows.push(`Date Range,${dateRange === 'all' ? 'All Time' : dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}`);
        excelRows.push('');

        if (exportOption === 'all' || exportOption === 'tasks') {
          // Header for tasks with better formatting
          excelRows.push('TASKS');
          excelRows.push('ID,Title,Completed,Pomodoros,Completed Pomodoros,Updated At');

          // Tasks data
          filteredTasks.forEach(task => {
            excelRows.push(`${task.id},"${task.title.replace(/"/g, '""')}",${task.completed ? 'Yes' : 'No'},${task.pomodoros},${task.completedPomodoros},${new Date(task.updatedAt).toLocaleString()}`);
          });

          excelRows.push('');
        }

        if (exportOption === 'all' || exportOption === 'timeTracking') {
          // Time tracking data with better formatting
          excelRows.push('TIME TRACKING SUMMARY');
          excelRows.push('Task ID,Task Title,Total Time (HH:MM:SS),Currently Tracking');

          const timeTrackingTasks = filteredTasks.filter(task =>
            task.timeTracking && task.timeTracking.history && task.timeTracking.history.length > 0
          );

          timeTrackingTasks.forEach(task => {
            excelRows.push(`${task.id},"${task.title.replace(/"/g, '""')}",${formatTime(task.timeTracking?.totalTime || 0)},${task.timeTracking?.isTracking ? 'Yes' : 'No'}`);
          });

          excelRows.push('');
          excelRows.push('DETAILED TIME TRACKING SESSIONS');
          excelRows.push('Task ID,Task Title,Date,Start Time,End Time,Duration (HH:MM:SS)');

          timeTrackingTasks.forEach(task => {
            if (task.timeTracking?.history) {
              task.timeTracking.history.forEach(session => {
                const startDate = new Date(session.start);
                excelRows.push(
                  `${task.id},"${task.title.replace(/"/g, '""')}",${startDate.toLocaleDateString()},${formatTimeOnly(session.start)},${formatTimeOnly(session.end)},${formatTime(session.duration)}`
                );
              });
            }
          });

          excelRows.push('');
        }

        if (exportOption === 'all' || exportOption === 'sessions') {
          // Session history with better formatting
          excelRows.push('POMODORO SESSION HISTORY');
          excelRows.push('Type,Task,Completed,Timestamp');

          filteredSessionHistory.forEach(session => {
            excelRows.push(`${session.type},"${session.task.replace(/"/g, '""')}",${session.completed ? 'Yes' : 'No'},${new Date(session.timestamp).toLocaleString()}`);
          });

          excelRows.push('');
        }

        if (exportOption === 'all') {
          // Stats with better formatting
          excelRows.push('STATISTICS');
          excelRows.push(`Total Pomodoros,${completedPomodoros}`);
          excelRows.push(`Total Focus Time,${formatTime(gamificationData.totalFocusTime * 1000)}`);
          excelRows.push(`Total Completed Tasks,${gamificationData.totalCompletedTasks}`);
          excelRows.push(`Level,${gamificationData.level}`);
          excelRows.push(`Points,${gamificationData.points}`);
          excelRows.push(`Streak,${gamificationData.streak}`);
        }

        // Join with newlines
        data = excelRows.join('\n');
        mimeType = 'text/csv';
        filename += '.xlsx';
      }

      // Create download link
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setIsExporting(false);

      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setExportError('Failed to export data. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleExportModal}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Data
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Close modal when clicking outside
              if (e.target === e.currentTarget) toggleExportModal();
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Your Data</h2>
                <button
                  onClick={toggleExportModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Export your Pomodoro Timer data to keep a backup or analyze your productivity. Choose what data to export and in which format.
              </p>

              {exportError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{exportError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What to Export
                  </label>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="exportOption"
                        checked={exportOption === 'all'}
                        onChange={() => setExportOption('all')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">All Data</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="exportOption"
                        checked={exportOption === 'tasks'}
                        onChange={() => setExportOption('tasks')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Tasks Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="exportOption"
                        checked={exportOption === 'sessions'}
                        onChange={() => setExportOption('sessions')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Pomodoro Sessions Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="exportOption"
                        checked={exportOption === 'timeTracking'}
                        onChange={() => setExportOption('timeTracking')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Time Tracking Data Only</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="dateRange"
                        checked={dateRange === 'all'}
                        onChange={() => setDateRange('all')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">All Time</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="dateRange"
                        checked={dateRange === 'today'}
                        onChange={() => setDateRange('today')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Today Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="dateRange"
                        checked={dateRange === 'week'}
                        onChange={() => setDateRange('week')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Last 7 Days</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        name="dateRange"
                        checked={dateRange === 'month'}
                        onChange={() => setDateRange('month')}
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Last 30 Days</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex-1 min-w-[100px] flex items-center justify-center cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      className="sr-only"
                      name="exportFormat"
                      checked={exportFormat === 'json'}
                      onChange={() => handleExportFormatChange('json')}
                    />
                    <div className={`flex flex-col items-center ${exportFormat === 'json' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">JSON</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">For developers</span>
                    </div>
                  </label>

                  <label className="flex-1 min-w-[100px] flex items-center justify-center cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      className="sr-only"
                      name="exportFormat"
                      checked={exportFormat === 'csv'}
                      onChange={() => handleExportFormatChange('csv')}
                    />
                    <div className={`flex flex-col items-center ${exportFormat === 'csv' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">CSV</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">For spreadsheets</span>
                    </div>
                  </label>

                  <label className="flex-1 min-w-[100px] flex items-center justify-center cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      className="sr-only"
                      name="exportFormat"
                      checked={exportFormat === 'excel'}
                      onChange={() => handleExportFormatChange('excel')}
                    />
                    <div className={`flex flex-col items-center ${exportFormat === 'excel' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Excel</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">For Excel users</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  <p>
                    {sessionHistory.length} sessions, {tasks.length} tasks
                    {tasks.filter(t => t.timeTracking?.history?.length > 0).length > 0 &&
                      `, ${tasks.filter(t => t.timeTracking?.history?.length > 0).length} tasks with time tracking`
                    }
                  </p>
                  <p className="text-xs mt-1">
                    {dateRange === 'all'
                      ? 'Exporting all data'
                      : dateRange === 'today'
                        ? 'Exporting today\'s data only'
                        : dateRange === 'week'
                          ? 'Exporting last 7 days'
                          : 'Exporting last 30 days'
                    }
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={toggleExportModal}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    disabled={isExporting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={exportData}
                    className={`px-4 py-2 rounded-md flex items-center justify-center min-w-[100px] ${
                      exportSuccess
                        ? 'bg-green-600 text-white'
                        : isExporting
                          ? 'bg-indigo-500 text-white cursor-wait'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed`}
                    disabled={exportSuccess || isExporting}
                  >
                    {exportSuccess ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Exported!
                      </span>
                    ) : isExporting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
