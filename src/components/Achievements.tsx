"use client";

import { useState, useEffect } from 'react';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  requirement: {
    type: 'pomodoros' | 'tasks' | 'streak' | 'focus_time';
    count: number;
  };
};

type AchievementsProps = {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
};

export default function Achievements({ isOpen, onClose, achievements, onAchievementClick }: AchievementsProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>(achievements);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredAchievements(achievements);
    } else if (filter === 'unlocked') {
      setFilteredAchievements(achievements.filter(a => a.unlocked));
    } else {
      setFilteredAchievements(achievements.filter(a => !a.unlocked));
    }
  }, [filter, achievements]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Achievements</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md cursor-pointer ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-md cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-md cursor-pointer ${
              filter === 'locked'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Locked
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                onClick={() => onAchievementClick(achievement)}
                className={`p-4 rounded-lg border cursor-pointer transition-all transform hover:scale-105 ${
                  achievement.unlocked
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`text-2xl mr-3 ${achievement.unlocked ? '' : 'text-gray-400 dark:text-gray-500'}`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${achievement.unlocked ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {achievement.unlocked ? (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Unlocked {achievement.unlockedAt ? `on ${achievement.unlockedAt.toLocaleDateString()}` : ''}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {achievement.requirement.type === 'pomodoros' && `Complete ${achievement.requirement.count} pomodoros`}
                    {achievement.requirement.type === 'tasks' && `Complete ${achievement.requirement.count} tasks`}
                    {achievement.requirement.type === 'streak' && `Maintain a ${achievement.requirement.count}-day streak`}
                    {achievement.requirement.type === 'focus_time' && `Focus for ${Math.floor(achievement.requirement.count / 60)} hours`}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No achievements found for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
