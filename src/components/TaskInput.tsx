"use client";

import React, { useState, useEffect } from 'react';

interface TaskInputProps {
  onTaskChange: (task: string) => void;
  currentTask: string;
  onTaskSubmit?: (task: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onTaskChange, currentTask, onTaskSubmit }) => {
  const [task, setTask] = useState(currentTask);
  const [, setIsTaskSet] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setTask(currentTask);
    setIsTaskSet(currentTask.trim() !== '');
  }, [currentTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() !== '') {
      onTaskChange(task);
      setIsTaskSet(true);
      setShowFeedback(true);

      // Hide the feedback message after 2 seconds
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);

      // Jika ada onTaskSubmit, panggil untuk menambahkan ke task list
      if (onTaskSubmit) {
        onTaskSubmit(task);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Task</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-gray-700">
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 dark:text-gray-200 py-2 px-3 leading-tight focus:outline-none"
            type="text"
            placeholder="What are you working on?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            aria-label="Task name"
          />
          <button
            className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center"
            type="submit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Set
          </button>
        </div>
      </form>

      {/* Task status feedback */}
      <div className="text-center">
        {showFeedback && (
          <div className="text-emerald-600 dark:text-emerald-400 text-sm animate-fade-in-out font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Task set successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskInput;
