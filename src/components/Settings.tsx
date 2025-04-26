"use client";

import React from 'react';

type SettingsProps = {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  onPomodoroTimeChange: (time: number) => void;
  onShortBreakTimeChange: (time: number) => void;
  onLongBreakTimeChange: (time: number) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Settings({
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
  onPomodoroTimeChange,
  onShortBreakTimeChange,
  onLongBreakTimeChange,
  isOpen,
  onClose,
}: SettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Pomodoro Time (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={pomodoroTime / 60}
            onChange={(e) => onPomodoroTimeChange(parseInt(e.target.value) * 60)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-all"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Short Break Time (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={shortBreakTime / 60}
            onChange={(e) => onShortBreakTimeChange(parseInt(e.target.value) * 60)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-all"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Long Break Time (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={longBreakTime / 60}
            onChange={(e) => onLongBreakTimeChange(parseInt(e.target.value) * 60)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
