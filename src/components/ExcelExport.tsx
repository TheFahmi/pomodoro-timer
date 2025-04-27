"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from './TaskList';
import { SessionHistory } from './PomodoroApp';

interface ExcelExportProps {
  tasks: Task[];
  sessionHistory: SessionHistory[];
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

interface ExportData {
  tasks?: {
    Title: string;
    Completed: string;
    'Total Pomodoros': number;
    'Completed Pomodoros': number;
    'Created At': string;
    'Updated At': string;
  }[];
  sessions?: {
    Type: string;
    Completed: string;
    'Duration (minutes)': number;
    Date: string;
  }[];
}

export default function ExcelExport({
  tasks,
  sessionHistory,
  pomodoroTime,
  shortBreakTime,
  longBreakTime
}: ExcelExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOption, setExportOption] = useState<'all' | 'tasks' | 'sessions'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isExporting, setIsExporting] = useState(false);
  
  // Generate Excel file
  const generateExcel = () => {
    setIsExporting(true);
    
    // In a real implementation, this would use a library like exceljs or xlsx
    // to generate an actual Excel file. For this demo, we'll simulate the process.
    
    setTimeout(() => {
      // Filter data based on selected options
      let filteredTasks = [...tasks];
      let filteredSessions = [...sessionHistory];
      
      // Apply date filter
      if (dateRange !== 'all') {
        const now = new Date();
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
        
        filteredSessions = filteredSessions.filter(session => 
          session.date ? new Date(session.date) >= cutoffDate : false
        );
      }
      
      // Prepare data for export
      const data: ExportData = {};
      
      if (exportOption === 'all' || exportOption === 'tasks') {
        data.tasks = filteredTasks.map(task => ({
          Title: task.title,
          Completed: task.completed ? 'Yes' : 'No',
          'Total Pomodoros': task.pomodoros,
          'Completed Pomodoros': task.completedPomodoros,
          'Created At': new Date(task.updatedAt).toLocaleString(),
          'Updated At': new Date(task.updatedAt).toLocaleString()
        }));
      }
      
      if (exportOption === 'all' || exportOption === 'sessions') {
        data.sessions = filteredSessions.map(session => ({
          Type: session.type,
          Completed: session.completed ? 'Yes' : 'No',
          'Duration (minutes)': session.type === 'pomodoro' 
            ? pomodoroTime / 60 
            : session.type === 'shortBreak' 
              ? shortBreakTime / 60 
              : longBreakTime / 60,
          Date: session.date ? new Date(session.date).toLocaleString() : 'N/A'
        }));
      }
      
      // In a real implementation, we would now generate the Excel file
      // and trigger a download. For this demo, we'll just log the data.
      console.log('Exporting data to Excel:', data);
      
      // Create a fake Excel file download
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pomodoro_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setIsOpen(false);
    }, 1500);
  };
  
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export to Excel
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-51 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Data</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What to export:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="export-all"
                        name="exportOption"
                        value="all"
                        checked={exportOption === 'all'}
                        onChange={() => setExportOption('all')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="export-all" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        All data
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="export-tasks"
                        name="exportOption"
                        value="tasks"
                        checked={exportOption === 'tasks'}
                        onChange={() => setExportOption('tasks')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="export-tasks" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Tasks only
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="export-sessions"
                        name="exportOption"
                        value="sessions"
                        checked={exportOption === 'sessions'}
                        onChange={() => setExportOption('sessions')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="export-sessions" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Sessions only
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date range:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="date-all"
                        name="dateRange"
                        value="all"
                        checked={dateRange === 'all'}
                        onChange={() => setDateRange('all')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="date-all" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        All time
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="date-today"
                        name="dateRange"
                        value="today"
                        checked={dateRange === 'today'}
                        onChange={() => setDateRange('today')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="date-today" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Today only
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="date-week"
                        name="dateRange"
                        value="week"
                        checked={dateRange === 'week'}
                        onChange={() => setDateRange('week')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="date-week" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Last 7 days
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="date-month"
                        name="dateRange"
                        value="month"
                        checked={dateRange === 'month'}
                        onChange={() => setDateRange('month')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="date-month" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Last 30 days
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  onClick={generateExcel}
                  disabled={isExporting}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




