"use client";

import { useState } from 'react';
import { SessionHistory } from './PomodoroApp';
import { Task } from './TaskList';
import { GamificationData } from './Gamification';

type ExportDataProps = {
  sessionHistory: SessionHistory[];
  tasks: Task[];
  completedPomodoros: number;
  gamificationData: GamificationData;
};

export default function ExportData({ sessionHistory, tasks, completedPomodoros, gamificationData }: ExportDataProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportSuccess, setExportSuccess] = useState(false);

  const toggleExportModal = () => {
    setIsOpen(!isOpen);
    setExportSuccess(false);
  };

  const handleExportFormatChange = (format: 'json' | 'csv') => {
    setExportFormat(format);
  };

  const exportData = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      let filename = `pomodoro-data-${dateStr}`;
      let data: string;
      let mimeType: string;

      // Prepare data object
      const exportObject = {
        exportDate: now.toISOString(),
        stats: {
          totalPomodoros: completedPomodoros,
          totalFocusTime: gamificationData.totalFocusTime,
          totalCompletedTasks: gamificationData.totalCompletedTasks,
          level: gamificationData.level,
          points: gamificationData.points,
          streak: gamificationData.streak,
        },
        achievements: gamificationData.achievements.filter(a => a.unlocked),
        sessionHistory,
        tasks,
      };

      if (exportFormat === 'json') {
        data = JSON.stringify(exportObject, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else {
        // CSV export
        const csvRows = [];
        
        // Header for session history
        csvRows.push('Session History');
        csvRows.push('Type,Task,Completed,Timestamp');
        
        // Session history data
        sessionHistory.forEach(session => {
          csvRows.push(`${session.type},${session.task.replace(/,/g, ' ')},${session.completed},${session.timestamp}`);
        });
        
        // Add empty row as separator
        csvRows.push('');
        
        // Header for tasks
        csvRows.push('Tasks');
        csvRows.push('ID,Title,Completed,Pomodoros,CompletedPomodoros');
        
        // Tasks data
        tasks.forEach(task => {
          csvRows.push(`${task.id},${task.title.replace(/,/g, ' ')},${task.completed},${task.pomodoros},${task.completedPomodoros}`);
        });
        
        // Add empty row as separator
        csvRows.push('');
        
        // Stats
        csvRows.push('Statistics');
        csvRows.push(`Total Pomodoros,${completedPomodoros}`);
        csvRows.push(`Total Focus Time (seconds),${gamificationData.totalFocusTime}`);
        csvRows.push(`Total Completed Tasks,${gamificationData.totalCompletedTasks}`);
        csvRows.push(`Level,${gamificationData.level}`);
        csvRows.push(`Points,${gamificationData.points}`);
        csvRows.push(`Streak,${gamificationData.streak}`);
        
        // Join with newlines
        data = csvRows.join('\n');
        mimeType = 'text/csv';
        filename += '.csv';
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
      
      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <>
      <button
        onClick={toggleExportModal}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Export Your Data</h2>
              <button
                onClick={toggleExportModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export your Pomodoro Timer data to keep a backup or analyze your productivity.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="exportFormat"
                    checked={exportFormat === 'json'}
                    onChange={() => handleExportFormatChange('json')}
                  />
                  <span className="ml-2">JSON</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="exportFormat"
                    checked={exportFormat === 'csv'}
                    onChange={() => handleExportFormatChange('csv')}
                  />
                  <span className="ml-2">CSV</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {sessionHistory.length} sessions, {tasks.length} tasks
              </div>
              <button
                onClick={exportData}
                className={`px-4 py-2 rounded-md ${
                  exportSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } transition-colors cursor-pointer`}
                disabled={exportSuccess}
              >
                {exportSuccess ? (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Exported!
                  </span>
                ) : (
                  'Export'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
