"use client";

import { useState } from 'react';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  pomodoros: number; // Estimated number of pomodoros
  completedPomodoros: number; // Completed pomodoros
  updatedAt: number; // Timestamp of last update
};

type TaskListProps = {
  tasks: Task[];
  currentTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskAdd: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
};

export default function TaskList({
  tasks,
  currentTaskId,
  onTaskSelect,
  onTaskAdd,
  onTaskUpdate,
  onTaskDelete,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        pomodoros: newTaskPomodoros,
        completedPomodoros: 0,
        updatedAt: 0
      };
      onTaskAdd(newTask);
      setNewTaskTitle('');
      setNewTaskPomodoros(1);
      setIsAddingTask(false);
    }
  };

  const toggleTaskCompletion = (task: Task) => {
    onTaskUpdate({
      ...task,
      completed: !task.completed,
    });
  };

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Task List
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Plan your tasks and track your progress. Each task can have multiple Pomodoro sessions.
        </p>
      </div>

      <div className="mb-4">
        {tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No tasks yet. Add a task to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`p-3 rounded-lg transition-colors ${
                  task.completed
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
                    : currentTaskId === task.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 cursor-default'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span
                      className={`${
                        task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {task.completedPomodoros}/{task.pomodoros}
                    </div>

                    {!task.completed && (
                      <button
                        onClick={() => onTaskSelect(task.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          currentTaskId === task.id
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                        } cursor-pointer transition-colors`}
                        title={currentTaskId === task.id ? 'Current task' : 'Start this task'}
                      >
                        {currentTaskId === task.id ? 'Current' : 'Start'}
                      </button>
                    )}

                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 cursor-pointer transition-colors"
                      title="Delete task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAddingTask ? (
        <form onSubmit={handleAddTask} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="mb-3">
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Name
            </label>
            <input
              type="text"
              id="taskTitle"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="What are you working on?"
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="taskPomodoros" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Pomodoros
            </label>
            <input
              type="number"
              id="taskPomodoros"
              min="1"
              max="10"
              value={newTaskPomodoros}
              onChange={(e) => setNewTaskPomodoros(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer shadow-sm transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md flex items-center justify-center cursor-pointer shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Task
        </button>
      )}
    </div>
  );
}
