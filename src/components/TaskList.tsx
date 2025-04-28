"use client";

import React, { useState, useEffect } from 'react';
import TagManager, { getTagColor } from './TagManager';
import { AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import HabitTracker, { Habit } from './HabitTracker';
import { useDndSafeStrictMode, getValidDraggableId } from '../utils/dragDropUtils';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoros: number; // Estimated number of pomodoros
  completedPomodoros: number; // Completed pomodoros
  updatedAt: number; // Timestamp of last update
  tags: string[]; // Array of tags for categorizing tasks
  timeBlock?: { // Optional time block information
    startTime?: string;
    endTime?: string;
    date?: string;
  };
  timeTracking?: {
    isTracking: boolean;
    totalTime: number;
    startTime?: number;
    history: { start: number; end: number; duration: number }[];
};
}

type TaskListProps = {
  tasks: Task[];
  currentTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskAdd: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTagCreate?: (tag: string) => void; // Added prop for creating new tags
  availableTags?: string[]; // Available tags for suggestions
  closeTaskListModal?: () => void; // Callback to close the task list modal
  showInputFormByDefault?: boolean; // Whether to show the input form by default
  onTasksReorder?: (tasks: Task[]) => void; // Callback for when tasks are reordered

  // Props untuk Habit
  habits?: Habit[];
  onHabitAdd?: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'longestStreak'>) => void;
  onHabitComplete?: (habitId: string, date: string) => void;
  onHabitDelete?: (habitId: string) => void;
};

// Function untuk memformat waktu dalam format HH:MM:SS
const formatTimeSpent = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function TaskList({
  tasks,
  currentTaskId,
  onTaskSelect,
  onTaskAdd,
  onTaskUpdate,
  onTaskDelete,
  onTagCreate,
  availableTags = [],
  closeTaskListModal,
  showInputFormByDefault = false, // Default to false for showing input form
  onTasksReorder,

  // Tambahan untuk Habit
  habits = [],
  onHabitAdd,
  onHabitComplete,
  onHabitDelete
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);
  // Check if there's a flag in localStorage to show the add task form
  const [isAddingTask, setIsAddingTask] = useState(() => {
    if (typeof window !== 'undefined') {
      const showAddTaskForm = localStorage.getItem('pomodoroShowAddTaskForm');
      if (showAddTaskForm === 'true') {
        // Clear the flag
        localStorage.removeItem('pomodoroShowAddTaskForm');
        return true;
      }
    }
    return showInputFormByDefault;
  });
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [showTimeBlockOptions, setShowTimeBlockOptions] = useState(false);
  const [timeBlockStart, setTimeBlockStart] = useState('');
  const [timeBlockEnd, setTimeBlockEnd] = useState('');
  const [timeBlockDate, setTimeBlockDate] = useState(new Date().toISOString().split('T')[0]); // Today's date

  // State untuk timer update setiap detik
  const [, setTimerTick] = useState(0);

  // State untuk tampilan (grid atau list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // State untuk metode pengurutan
  const [sortMethod, setSortMethod] = useState<'default' | 'alphabetical' | 'alphabetical-reverse' | 'date-newest' | 'date-oldest' | 'pomodoros-highest' | 'pomodoros-lowest'>('default');

  // Update timer setiap detik
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mulai pelacakan waktu
  const startTimeTracking = (task: Task) => {
    const now = Date.now();
    const updatedTask: Task = {
      ...task,
      timeTracking: {
        isTracking: true,
        totalTime: task.timeTracking?.totalTime || 0,
        startTime: now,
        history: task.timeTracking?.history || []
      }
    };
    onTaskUpdate(updatedTask);
  };

  // Berhenti pelacakan waktu
  const stopTimeTracking = (task: Task) => {
    if (!task.timeTracking?.startTime) return;

    const now = Date.now();
    const sessionDuration = now - (task.timeTracking.startTime || 0);
    const updatedHistory = [
      ...(task.timeTracking.history || []),
      { start: task.timeTracking.startTime, end: now, duration: sessionDuration }
    ];

    const updatedTask: Task = {
      ...task,
      timeTracking: {
        isTracking: false,
        totalTime: (task.timeTracking.totalTime || 0) + sessionDuration,
        history: updatedHistory
      }
    };
    onTaskUpdate(updatedTask);
  };

  // Hitung waktu tracking real-time
  const calculateCurrentTrackedTime = (task: Task): number => {
    if (!task.timeTracking) return 0;

    const { isTracking, totalTime, startTime } = task.timeTracking;
    if (!isTracking || !startTime) return totalTime || 0;

    const now = Date.now();
    const currentSessionTime = now - startTime;
    return (totalTime || 0) + currentSessionTime;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        pomodoros: newTaskPomodoros,
        completedPomodoros: 0,
        updatedAt: Date.now(),
        tags: newTaskTags,
      };

      // Add time block information if provided
      if (showTimeBlockOptions && timeBlockStart && timeBlockEnd) {
        newTask.timeBlock = {
          startTime: timeBlockStart,
          endTime: timeBlockEnd,
          date: timeBlockDate
        };
      }

      // Tambahkan task ke daftar tasks
      onTaskAdd(newTask);

      // Reset form
      setNewTaskTitle('');
      setNewTaskPomodoros(1);
      setNewTaskTags([]);
      setShowTimeBlockOptions(false);
      setTimeBlockStart('');
      setTimeBlockEnd('');

      // Langsung pilih task baru sebagai current task
      handleTaskSelect(newTask.id);

      // Tutup form (opsional, karena modal akan tertutup oleh handleTaskSelect)
      setIsAddingTask(false);
    }
  };

  const toggleTaskCompletion = (task: Task) => {
    onTaskUpdate({
      ...task,
      completed: !task.completed,
      updatedAt: Date.now(),
    });
  };

  // Filter tasks by tags and completion status
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Reset filter status when component mounts
  useEffect(() => {
    setFilterStatus('all');
  }, []);

  // Apply filters to tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // Filter by tag if a tag is selected
      const tagMatch = !filterTag || task.tags.includes(filterTag);

      // Filter by completion status
      const statusMatch =
        filterStatus === 'all' ? true :
        filterStatus === 'active' ? !task.completed :
        task.completed;

      return tagMatch && statusMatch;
    });
  }, [tasks, filterTag, filterStatus]);

  // Tambahkan di bagian state
  const [showSessionDetail, setShowSessionDetail] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<{ taskId: string, sessionIndex: number } | null>(null);
  const [editSessionStart, setEditSessionStart] = useState('');
  const [editSessionEnd, setEditSessionEnd] = useState('');

  // Tambahkan fungsi untuk mengonversi timestamp ke format string jam
  const formatTimeStampToTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Tambahkan fungsi untuk mengonversi format string jam ke timestamp
  const timeToTimestamp = (timeString: string, baseDate: number): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  // Tambahkan fungsi untuk mengedit sesi
  const handleEditSession = (taskId: string, sessionIndex: number, start: number, end: number) => {
    setEditingSession({ taskId, sessionIndex });
    setEditSessionStart(formatTimeStampToTime(start));
    setEditSessionEnd(formatTimeStampToTime(end));
  };

  // Tambahkan fungsi untuk menyimpan hasil editan sesi
  const saveSessionEdit = () => {
    if (!editingSession) return;

    const { taskId, sessionIndex } = editingSession;
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.timeTracking || !task.timeTracking.history[sessionIndex]) return;

    const originalSession = task.timeTracking.history[sessionIndex];
    const baseDate = new Date(originalSession.start).setHours(0, 0, 0, 0);

    const newStart = timeToTimestamp(editSessionStart, baseDate);
    const newEnd = timeToTimestamp(editSessionEnd, baseDate);
    const newDuration = newEnd - newStart;

    if (newDuration <= 0) return;

    const updatedHistory = [...task.timeTracking.history];
    updatedHistory[sessionIndex] = {
      start: newStart,
      end: newEnd,
      duration: newDuration
    };

    // Hitung ulang total waktu dari semua sesi
    const newTotalTime = updatedHistory.reduce((total, session) => total + session.duration, 0);

    const updatedTask = {
      ...task,
      timeTracking: {
        ...task.timeTracking,
        totalTime: newTotalTime,
        history: updatedHistory
      }
    };

    onTaskUpdate(updatedTask);
    setEditingSession(null);
  };

  // Tambahkan fungsi untuk membatalkan editan
  const cancelSessionEdit = () => {
    setEditingSession(null);
  };

  // Fungsi untuk menghandle pemilihan task dan menutup modal
  const handleTaskSelect = (taskId: string) => {
    onTaskSelect(taskId);
    if (closeTaskListModal) {
      closeTaskListModal();
    }
  };

  // Ref untuk fokus ke input task title
  const taskTitleInputRef = React.useRef<HTMLInputElement>(null);

  // Focus ke input setelah komponen di-mount
  React.useEffect(() => {
    if (isAddingTask && taskTitleInputRef.current) {
      taskTitleInputRef.current.focus();
    }
  }, [isAddingTask]);

  // Tambahkan keyboard shortcut untuk menambahkan task dengan Enter dan Escape untuk membatalkan
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAddingTask(false);
    }
  };

  // State untuk memisahkan tugas aktif dan yang sudah selesai
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  // Fungsi untuk mengurutkan tugas berdasarkan metode yang dipilih
  const sortTasks = React.useCallback((tasksToSort: Task[]): Task[] => {
    if (sortMethod === 'default') {
      return tasksToSort; // Gunakan urutan default (manual ordering)
    }

    // Buat salinan array untuk diurutkan
    const sortedTasks = [...tasksToSort];

    switch (sortMethod) {
      case 'alphabetical':
        return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
      case 'alphabetical-reverse':
        return sortedTasks.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-newest':
        return sortedTasks.sort((a, b) => b.updatedAt - a.updatedAt);
      case 'date-oldest':
        return sortedTasks.sort((a, b) => a.updatedAt - b.updatedAt);
      case 'pomodoros-highest':
        return sortedTasks.sort((a, b) => b.pomodoros - a.pomodoros);
      case 'pomodoros-lowest':
        return sortedTasks.sort((a, b) => a.pomodoros - b.pomodoros);
      default:
        return sortedTasks;
    }
  }, [sortMethod]);

  // State untuk task yang sedang diedit posisinya
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState<number>(0);

  // Fungsi untuk memindahkan task ke posisi tertentu
  const moveTaskToPosition = (taskId: string, newIndex: number) => {
    // Pastikan index valid
    if (newIndex < 0 || newIndex >= activeTasks.length) {
      return;
    }

    // Temukan index task saat ini
    const currentIndex = activeTasks.findIndex(task => task.id === taskId);
    if (currentIndex === -1) return;

    // Buat salinan array untuk dimanipulasi
    const newActiveTasks = [...activeTasks];

    // Pindahkan task ke posisi baru
    const [movedTask] = newActiveTasks.splice(currentIndex, 1);
    newActiveTasks.splice(newIndex, 0, movedTask);

    // Update state
    setActiveTasks(newActiveTasks);

    // Update parent component dengan urutan baru
    if (onTasksReorder) {
      const newTasks = [...newActiveTasks, ...completedTasks];
      onTasksReorder(newTasks);
    }

    // Reset state editing
    setEditingPosition(null);
    setNewPosition(0);
  };

  // Memisahkan tugas aktif dan yang sudah selesai
  useEffect(() => {
    // Filter tugas aktif dan selesai
    const active = tasks.filter(task => !task.completed);
    const completed = tasks.filter(task => task.completed);

    // Terapkan pengurutan hanya pada tugas aktif
    setActiveTasks(sortTasks(active));
    setCompletedTasks(completed);
  }, [tasks, sortMethod, sortTasks]);

  // Handle drag end para reordering tugas
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Jika tugas di-drop di luar area
    if (!destination) return;

    // Jika tugas di-drop di posisi yang sama
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Jika reordering dalam active tasks
    if (source.droppableId === 'active-tasks' && destination.droppableId === 'active-tasks') {
      const newActiveTasks = Array.from(activeTasks);
      const [movedTask] = newActiveTasks.splice(source.index, 1);
      newActiveTasks.splice(destination.index, 0, movedTask);

      // Update local state first
      setActiveTasks(newActiveTasks);

      // Update parent component dengan urutan baru (gabungkan dengan completed tasks)
      if (onTasksReorder) {
        const newTasks = [...newActiveTasks, ...completedTasks];
        onTasksReorder(newTasks);
      }
    }
  };

  // State untuk menampilkan task list atau habit
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits'>('tasks');

  // Use the strict mode workaround for react-beautiful-dnd
  const isDndEnabled = useDndSafeStrictMode();

  // Add a cleanup function for any stuck drag operations
  useEffect(() => {
    const handleClickOutside = () => {
      // This helps reset any stuck drag operations when clicking outside
      if (document.body.classList.contains('dnd-dragging')) {
        document.body.classList.remove('dnd-dragging');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render task card untuk tampilan grid
  const renderTaskCard = (task: Task) => {
    return (
      <div
        key={task.id}
        className={`${viewMode === 'grid' ? 'p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200' : ''} ${
          viewMode === 'grid' && task.id === currentTaskId
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/50 dark:ring-indigo-500/30'
            : viewMode === 'grid' ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : ''
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task)}
              />
              <h3
                className={`text-base font-medium ${
                  task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                } truncate cursor-pointer group flex items-center gap-2`}
                onClick={() => handleTaskSelect(task.id)}
              >
                {task.title}
                {task.id === currentTaskId && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Current
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={() => onTaskDelete(task.id)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="flex-grow">
            <div className={`text-xs ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {task.completedPomodoros}/{task.pomodoros} pomodoros
              </span>
            </div>

            {/* Tampilkan waktu yang dihabiskan */}
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Total: {formatTimeSpent(calculateCurrentTrackedTime(task))}
              </span>

              {/* Tombol untuk menampilkan detail sesi */}
              {task.timeTracking?.history && task.timeTracking.history.length > 0 && (
                <button
                  onClick={() => setShowSessionDetail(showSessionDetail === task.id ? null : task.id)}
                  className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                >
                  {showSessionDetail === task.id ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Details
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Detail sesi waktu */}
            {showSessionDetail === task.id && task.timeTracking?.history && task.timeTracking.history.length > 0 && (
              <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-md p-2 text-xs">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time Sessions</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {task.timeTracking.history.map((session, index) => {
                    const startDate = new Date(session.start);
                    // We use startDate for the formatted date
                    const formattedDate = startDate.toLocaleDateString();
                    const formattedStartTime = formatTimeStampToTime(session.start);
                    const formattedEndTime = formatTimeStampToTime(session.end);

                    return (
                      <div
                        key={`${task.id}-session-${index}`}
                        className={`flex items-center justify-between p-1.5 rounded ${
                          editingSession && editingSession.taskId === task.id && editingSession.sessionIndex === index
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        {editingSession && editingSession.taskId === task.id && editingSession.sessionIndex === index ? (
                          // Editing mode
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={saveSessionEdit}
                                  className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 p-1"
                                  title="Save changes"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={cancelSessionEdit}
                                  className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 p-1"
                                  title="Cancel"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <label className="block text-gray-500 dark:text-gray-400 text-2xs mb-0.5">Start</label>
                                <input
                                  type="time"
                                  value={editSessionStart}
                                  onChange={(e) => setEditSessionStart(e.target.value)}
                                  className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-gray-500 dark:text-gray-400 text-2xs mb-0.5">End</label>
                                <input
                                  type="time"
                                  value={editSessionEnd}
                                  onChange={(e) => setEditSessionEnd(e.target.value)}
                                  className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <>
                            <div>
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-300">{formattedDate}</span>
                              </div>
                              <div className="flex items-center mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-300">
                                  {formattedStartTime} - {formattedEndTime} ({formatTimeSpent(session.duration)})
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditSession(task.id, index, session.start, session.end)}
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                              title="Edit session"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menampilkan progress bar untuk current task */}
            {task.id === currentTaskId && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500"
                    style={{
                      width: `${Math.min(100, (task.completedPomodoros / task.pomodoros) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Display tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={`${task.id}-${tag}`}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between items-center">
            {!task.completed && task.id !== currentTaskId && (
              <button
                onClick={() => handleTaskSelect(task.id)}
                className="py-1 px-2 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-800 rounded flex items-center gap-1 font-medium transition-colors dark:bg-indigo-900/30 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Set as Current
              </button>
            )}

            <button
              onClick={() => task.timeTracking?.isTracking ? stopTimeTracking(task) : startTimeTracking(task)}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 ml-auto ${
                task.timeTracking?.isTracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {task.timeTracking?.isTracking ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 task-list-component">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'tasks'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Tasks
          </div>
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'habits'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Habits
          </div>
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <>
            {isAddingTask ? (
        <form onSubmit={handleAddTask} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Task
                </div>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              id="taskTitle"
              ref={taskTitleInputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="What are you working on?"
              onKeyDown={handleKeyDown}
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

          <div className="mb-3">
            <label htmlFor="taskTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <TagManager
              availableTags={availableTags}
              selectedTags={newTaskTags}
              onTagsChange={setNewTaskTags}
              onTagCreate={onTagCreate}
            />
          </div>

          {/* Time Block Feature */}
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="enableTimeBlock"
                checked={showTimeBlockOptions}
                onChange={() => setShowTimeBlockOptions(!showTimeBlockOptions)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="enableTimeBlock" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Add Time Block
              </label>
            </div>

            {showTimeBlockOptions && (
              <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="timeBlockDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <input
                      type="date"
                      id="timeBlockDate"
                      value={timeBlockDate}
                      onChange={(e) => setTimeBlockDate(e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="timeBlockStart" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="timeBlockStart"
                      value={timeBlockStart}
                      onChange={(e) => setTimeBlockStart(e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="timeBlockEnd" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="timeBlockEnd"
                      value={timeBlockEnd}
                      onChange={(e) => setTimeBlockEnd(e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer shadow-sm transition-colors flex items-center"
              disabled={!newTaskTitle.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Task
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 relative overflow-hidden group"
          data-action="add-task"
        >
          <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full bg-indigo-800 group-hover:translate-x-0"></span>
          <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-full bg-indigo-700 group-hover:translate-x-0 delay-75"></span>
          <span className="relative flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="text-base">Add New Task</span>
          </span>
        </button>
      )}
      <div className="my-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Task List
          </h2>

          {/* Controls container */}
          <div className="flex items-center space-x-3">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value as 'default' | 'alphabetical' | 'alphabetical-reverse' | 'date-newest' | 'date-oldest' | 'pomodoros-highest' | 'pomodoros-lowest')}
                className="appearance-none bg-gray-100 dark:bg-gray-700 border-0 rounded-lg py-1.5 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Sort tasks"
              >
                <option value="default">Default Order</option>
                <option value="alphabetical">A-Z</option>
                <option value="alphabetical-reverse">Z-A</option>
                <option value="date-newest">Newest First</option>
                <option value="date-oldest">Oldest First</option>
                <option value="pomodoros-highest">Most Pomodoros</option>
                <option value="pomodoros-lowest">Least Pomodoros</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Grid View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>


        <div className="mt-2 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md text-xs text-blue-700 dark:text-blue-300 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {viewMode === 'list'
              ? "Plan your tasks and track your progress. Use the drag handle (≡) to reorder tasks or click the position number to change task order."
              : "Plan your tasks and track your progress in grid view. Click the position number to change task order."}
          </p>
        </div>
      </div>

      {/* Task Status Filter Tabs */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center">
              {filterStatus === 'all' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>All Tasks ({tasks.length})</span>
            </div>
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-colors ${
              filterStatus === 'active'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center">
              {filterStatus === 'active' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>Active ({tasks.filter(t => !t.completed).length})</span>
            </div>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-colors ${
              filterStatus === 'completed'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center">
              {filterStatus === 'completed' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>Completed ({tasks.filter(t => t.completed).length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tag filter buttons */}
      {availableTags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tags:</span>
            <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filterTag === null
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Tags
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filterTag === tag
                    ? getTagColor(tag) + ' ring-2 ring-offset-2 ring-indigo-300 dark:ring-indigo-700'
                    : getTagColor(tag) + ' hover:opacity-80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overall Pomodoro Progress */}
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Pomodoro Progress
          </h3>
          <div className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              {tasks.reduce((sum, task) => sum + task.completedPomodoros, 0)}/{tasks.reduce((sum, task) => sum + task.pomodoros, 0)} completed
            </span>
          </div>
        </div>
        <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
          <div
            className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${tasks.reduce((sum, task) => sum + task.pomodoros, 0) > 0
                ? (tasks.reduce((sum, task) => sum + task.completedPomodoros, 0) / tasks.reduce((sum, task) => sum + task.pomodoros, 0)) * 100
                : 0}%`
            }}
          ></div>
        </div>
      </div>

      <div className="mb-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
            {tasks.length === 0 ? (
              <div>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-200 dark:text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 absolute -bottom-2 -right-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">No tasks yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add a task to get started with your pomodoro sessions</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-300 dark:text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">No tasks match the selected filter</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try changing your filter settings</p>
              </div>
            )}
          </div>
        ) : viewMode === 'list' ? (
          // List View with drag and drop
          <DragDropContext
            onDragEnd={(result) => {
              // Remove the dragging class when drag ends
              document.body.classList.remove('dnd-dragging');
              handleDragEnd(result);
            }}
            onDragStart={() => {
              // Add a class to the body when dragging starts
              document.body.classList.add('dnd-dragging');
            }}
            enableDefaultSensors={true}>
            {isDndEnabled ? (
              <Droppable droppableId="active-tasks" isDropDisabled={false} ignoreContainerClipping={true} isCombineEnabled={false}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 p-2 rounded-lg transition-all duration-300 ${
                      snapshot.isDraggingOver
                        ? 'bg-indigo-50/80 dark:bg-indigo-900/30 shadow-inner border-2 border-dashed border-indigo-300 dark:border-indigo-700'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <AnimatePresence>
                      {/* Only show active tasks if filter is 'all' or 'active' */}
                      {(filterStatus === 'all' || filterStatus === 'active') && activeTasks
                        .filter(task => !filterTag || task.tags.includes(filterTag))
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={getValidDraggableId(task.id)}
                            index={index}
                            isDragDisabled={false}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  // Ensure the dragged item stays visible even when outside its container
                                  zIndex: snapshot.isDragging ? 9999 : 'auto'
                                }}
                                className={`p-3 rounded-lg border ${
                                  snapshot.isDragging
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-xl ring-2 ring-indigo-400'
                                    : task.id === currentTaskId
                                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/50 dark:ring-indigo-500/30'
                                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                } shadow-sm hover:shadow-md transition-all duration-200 ${
                                  snapshot.isDragging ? 'opacity-90 scale-[1.02] rotate-1' : ''
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="flex items-center">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex-shrink-0 mr-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing"
                                      title="Drag to reorder"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>

                                    {/* Posisi task dan kontrol untuk mengubah posisi */}
                                    <div className="flex items-center mr-2 text-sm">
                                      {editingPosition === task.id ? (
                                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                                          <input
                                            type="number"
                                            min="1"
                                            max={activeTasks.length}
                                            value={newPosition}
                                            onChange={(e) => setNewPosition(Math.max(1, Math.min(activeTasks.length, parseInt(e.target.value) || 1)))}
                                            className="w-12 px-1 py-0.5 text-center text-sm border-0 bg-transparent focus:ring-1 focus:ring-indigo-500"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                moveTaskToPosition(task.id, newPosition - 1);
                                              } else if (e.key === 'Escape') {
                                                setEditingPosition(null);
                                              }
                                            }}
                                          />
                                          <div className="flex flex-col px-1">
                                            <button
                                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-4 flex items-center justify-center"
                                              onClick={() => setNewPosition(prev => Math.min(activeTasks.length, prev + 1))}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                              </svg>
                                            </button>
                                            <button
                                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-4 flex items-center justify-center"
                                              onClick={() => setNewPosition(prev => Math.max(1, prev - 1))}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                              </svg>
                                            </button>
                                          </div>
                                          <div className="flex px-1">
                                            <button
                                              className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 p-1"
                                              onClick={() => moveTaskToPosition(task.id, newPosition - 1)}
                                              title="Confirm"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </button>
                                            <button
                                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 p-1"
                                              onClick={() => setEditingPosition(null)}
                                              title="Cancel"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                          onClick={() => {
                                            const currentIndex = activeTasks.findIndex(t => t.id === task.id);
                                            setNewPosition(currentIndex + 1);
                                            setEditingPosition(task.id);
                                          }}
                                          title="Change position"
                                        >
                                          {index + 1}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-grow">
                                    {renderTaskCard(task)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      }
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ) : (
              // Fallback when drag and drop is not yet enabled (during initialization)
              <div className="space-y-3">
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Initializing drag and drop...
                </p>
                {/* Only show active tasks if filter is 'all' or 'active' */}
                {(filterStatus === 'all' || filterStatus === 'active') && activeTasks
                  .filter(task => !filterTag || task.tags.includes(filterTag))
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border ${
                        task.id === currentTaskId
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/50 dark:ring-indigo-500/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      } shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center">
                        <div
                          className="flex-shrink-0 mr-2 p-1 rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50"
                          title="Drag and drop is initializing..."
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          {renderTaskCard(task)}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </DragDropContext>
        ) : (
          // Grid View without drag and drop
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Only show active tasks if filter is 'all' or 'active' */}
            {(filterStatus === 'all' || filterStatus === 'active') && activeTasks
              .filter(task => !filterTag || task.tags.includes(filterTag))
              .map((task, index) => (
                <div key={task.id} className="relative">
                  {/* Posisi task dan kontrol untuk mengubah posisi */}
                  <div className="absolute -top-2 -left-2 z-10">
                    {editingPosition === task.id ? (
                      <div className="flex items-center bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                        <input
                          type="number"
                          min="1"
                          max={activeTasks.length}
                          value={newPosition}
                          onChange={(e) => setNewPosition(Math.max(1, Math.min(activeTasks.length, parseInt(e.target.value) || 1)))}
                          className="w-12 px-1 py-0.5 text-center text-sm border-0 bg-transparent focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              moveTaskToPosition(task.id, newPosition - 1);
                            } else if (e.key === 'Escape') {
                              setEditingPosition(null);
                            }
                          }}
                        />
                        <div className="flex flex-col px-1">
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-4 flex items-center justify-center"
                            onClick={() => setNewPosition(prev => Math.min(activeTasks.length, prev + 1))}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-4 flex items-center justify-center"
                            onClick={() => setNewPosition(prev => Math.max(1, prev - 1))}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex px-1">
                          <button
                            className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 p-1"
                            onClick={() => moveTaskToPosition(task.id, newPosition - 1)}
                            title="Confirm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 p-1"
                            onClick={() => setEditingPosition(null)}
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shadow-md"
                        onClick={() => {
                          const currentIndex = activeTasks.findIndex(t => t.id === task.id);
                          setNewPosition(currentIndex + 1);
                          setEditingPosition(task.id);
                        }}
                        title="Change position"
                      >
                        {index + 1}
                      </button>
                    )}
                  </div>
                  {renderTaskCard(task)}
                </div>
              ))}
          </div>
        )}

        {/* Completed tasks section - only show if filter is 'all' or 'completed' */}
        {(filterStatus === 'all' || filterStatus === 'completed') &&
         completedTasks
          .filter(task => !filterTag || task.tags.includes(filterTag))
          .length > 0 && (
          <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Completed Tasks ({completedTasks.filter(task => !filterTag || task.tags.includes(filterTag)).length})
            </h3>
            <div className={viewMode === 'list' ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
              <AnimatePresence>
                {completedTasks
                  .filter(task => !filterTag || task.tags.includes(filterTag))
                  .map((task) => (
                    viewMode === 'list' ? (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/70"
                      >
                        {renderTaskCard(task)}
                      </div>
                    ) : (
                      renderTaskCard(task)
                    )
                  ))
                }
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
        </>
      ) : (
        // Habits tab content
        <div>
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Habit Tracker
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Build daily habits and track your progress consistently.
            </p>
          </div>

          <HabitTracker
            habits={habits}
            onHabitAdd={onHabitAdd}
            onHabitComplete={onHabitComplete}
            onHabitDelete={onHabitDelete}
          />
        </div>
      )}
    </div>
  );
}