"use client";

import { useState, useEffect } from 'react';
import { Task } from './TaskList';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

type SequentialTaskListProps = {
  tasks: Task[];
  currentTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTasksReorder: (tasks: Task[]) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  completedPomodoros: number;
};

export default function SequentialTaskList({
  tasks,
  currentTaskId,
  onTaskSelect,
  onTasksReorder,
  onTaskUpdate,
  onTaskDelete,
  completedPomodoros,
}: SequentialTaskListProps) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  // Separate active and completed tasks
  useEffect(() => {
    setActiveTasks(tasks.filter(task => !task.completed));
    setCompletedTasks(tasks.filter(task => task.completed));
  }, [tasks]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // If reordering within active tasks
    if (source.droppableId === 'active-tasks' && destination.droppableId === 'active-tasks') {
      const newActiveTasks = Array.from(activeTasks);
      const [movedTask] = newActiveTasks.splice(source.index, 1);
      newActiveTasks.splice(destination.index, 0, movedTask);
      
      setActiveTasks(newActiveTasks);
      
      // Update the parent component with the new order
      const newTasks = [...newActiveTasks, ...completedTasks];
      onTasksReorder(newTasks);
    }
  };

  const toggleTaskCompletion = (task: Task) => {
    onTaskUpdate({
      ...task,
      completed: !task.completed,
    });
  };

  // Calculate the next task in sequence
  const getNextTaskInSequence = () => {
    if (activeTasks.length === 0) return null;
    
    // If there's a current task, find the next one
    if (currentTaskId) {
      const currentIndex = activeTasks.findIndex(task => task.id === currentTaskId);
      if (currentIndex !== -1 && currentIndex < activeTasks.length - 1) {
        return activeTasks[currentIndex + 1];
      }
    }
    
    // Otherwise, return the first task
    return activeTasks[0];
  };

  const nextTask = getNextTaskInSequence();

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Sequential Tasks
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Drag and drop to reorder your tasks. Tasks will be suggested in sequence.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="mb-4">
          {activeTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No active tasks. Add tasks from the Task List.
            </p>
          ) : (
            <Droppable droppableId="active-tasks">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {activeTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 rounded-lg transition-colors ${
                            snapshot.isDragging
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                              : currentTaskId === task.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                              : nextTask && nextTask.id === task.id
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center justify-center h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-800 dark:text-gray-200">
                                {index + 1}
                              </div>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task)}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span>{task.title}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {task.completedPomodoros}/{task.pomodoros}
                              </div>

                              {currentTaskId === task.id ? (
                                <span className="text-xs px-2 py-1 rounded bg-indigo-500 text-white">
                                  Current
                                </span>
                              ) : nextTask && nextTask.id === task.id ? (
                                <button
                                  onClick={() => onTaskSelect(task.id)}
                                  className="text-xs px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer transition-colors"
                                  title="This is the next task in sequence"
                                >
                                  Next Up
                                </button>
                              ) : (
                                <button
                                  onClick={() => onTaskSelect(task.id)}
                                  className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer transition-colors"
                                >
                                  Start
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
                          
                          {/* Progress bar */}
                          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${(task.completedPomodoros / task.pomodoros) * 100}%` }}
                            ></div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          )}
        </div>
      </DragDropContext>

      {/* Completed tasks section */}
      {completedTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-2 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-1 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Completed Tasks ({completedTasks.length})
          </button>

          {showCompleted && (
            <ul className="space-y-2 mt-2">
              {completedTasks.map((task) => (
                <li
                  key={task.id}
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="line-through">{task.title}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        {task.completedPomodoros}/{task.pomodoros}
                      </div>

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
      )}

      {/* Overall progress */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Overall Progress</span>
          <span>{completedPomodoros} pomodoros completed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{
              width: `${
                tasks.length > 0
                  ? (completedPomodoros / tasks.reduce((sum, task) => sum + task.pomodoros, 0)) * 100
                  : 0
              }%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
