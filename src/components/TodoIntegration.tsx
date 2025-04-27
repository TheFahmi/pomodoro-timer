"use client";

import { useState } from 'react';
import { Task } from './TaskList';

// Define the Todoist task format
interface TodoistTask {
  id: string;
  content: string;
  priority: number;
  completed: boolean;
  project_id: string;
  project_name?: string; // We'll populate this from projects data
}

// Props for the TodoIntegration component
interface TodoIntegrationProps {
  onImportTasks?: (tasks: Task[]) => void;
}

export default function TodoIntegration({ onImportTasks = () => {} }: TodoIntegrationProps) {
  // State for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State untuk menyimpan token autentikasi
  const [, setAuthToken] = useState<string | null>(null);

  // State for Todoist tasks
  const [todoistTasks, setTodoistTasks] = useState<TodoistTask[]>([]);

  // State for selected tasks to import
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for projects
  const [todoistProjects, setTodoistProjects] = useState<{id: string, name: string}[]>([]);

  // State for filter options
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Handle authentication for Todoist
  const authenticateTodoist = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would redirect to Todoist OAuth
      // For demo purposes, we'll simulate authentication with a token input
      const token = prompt('Enter your Todoist API token:');

      if (!token) {
        setError('Authentication cancelled');
        setIsLoading(false);
        return;
      }

      // Validate the token by making a test API call
      const response = await fetch('https://api.todoist.com/rest/v2/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid token or API error');
      }

      // Store the token and set authentication status
      setAuthToken(token);
      setIsAuthenticated(true);

      // Fetch projects and tasks
      const projectsData = await response.json();
      setTodoistProjects(projectsData);

      await fetchTodoistTasks(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsAuthenticated(false);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Todoist tasks
  const fetchTodoistTasks = async (token: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();

      // Add project names to tasks
      const tasksWithProjects = tasks.map((task: TodoistTask) => {
        const project = todoistProjects.find(p => p.id === task.project_id);
        return {
          ...task,
          project_name: project ? project.name : 'Unknown Project'
        };
      });

      setTodoistTasks(tasksWithProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Handle task import
  const handleImportTasks = () => {
    // Convert selected Todoist tasks to app's Task format
    const tasksToImport = todoistTasks
      .filter(task => selectedTasks.includes(task.id))
      .map(task => ({
        id: `todoist-${task.id}`,
        title: task.content,
        completed: task.completed,
        pomodoros: task.priority, // Use priority as estimated pomodoros
        completedPomodoros: 0,
        notes: `Imported from Todoist (${task.project_name})`,
        createdAt: new Date()
      }));

    // Call the onImportTasks callback with the converted tasks
    if (tasksToImport.length > 0) {
      onImportTasks(tasksToImport);

      // Reset selection
      setSelectedTasks([]);

      // Show success message
      alert(`Successfully imported ${tasksToImport.length} tasks!`);
    }
  };

  // Filter tasks based on selected project and completion status
  const filteredTasks = () => {
    return todoistTasks.filter(task => {
      const projectMatch = selectedProject === 'all' || task.project_id === selectedProject;
      const completionMatch = showCompleted || !task.completed;
      return projectMatch && completionMatch;
    });
  };

  // Render the component
  return (
    <div className="w-full">
      {/* Authentication section */}
      {!isAuthenticated ? (
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Connect to your Todoist account to import tasks.
          </p>
          <button
            onClick={authenticateTodoist}
            disabled={isLoading}
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Connecting...' : 'Connect to Todoist'}
          </button>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div>
          {/* Filter options */}
          <div className="mb-4 flex flex-wrap gap-4">
            {/* Project filter */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Projects</option>
                {todoistProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            {/* Show completed checkbox */}
            <div className="flex items-center">
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2">Show completed tasks</span>
              </label>
            </div>
          </div>

          {/* Task list */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Tasks
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedTasks.length} of {filteredTasks().length} selected
              </span>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading tasks...
                </div>
              ) : filteredTasks().length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No tasks found. Try changing your filters.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {filteredTasks().map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${
                          task.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {task.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {task.project_name}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 4 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        task.priority === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        task.priority === 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        P{task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Import button */}
          <div className="flex justify-end">
            <button
              onClick={handleImportTasks}
              disabled={selectedTasks.length === 0 || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                selectedTasks.length === 0 || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Import {selectedTasks.length} {selectedTasks.length === 1 ? 'Task' : 'Tasks'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
