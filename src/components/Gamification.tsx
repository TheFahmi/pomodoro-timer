"use client";

import { useState, useEffect } from 'react';
import { Achievement } from './Achievements';

export type GamificationData = {
  points: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
  totalFocusTime: number; // in seconds
  totalCompletedPomodoros: number;
  totalCompletedTasks: number;
  achievements: Achievement[];
};

type GamificationProps = {
  data: GamificationData;
  onAchievementsClick: () => void;
};

export default function Gamification({ data, onAchievementsClick }: GamificationProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // Calculate XP needed for next level (increases with each level)
  const getNextLevelXP = (level: number) => 100 * Math.pow(1.5, level - 1);

  // Calculate progress to next level
  const currentLevelXP = getNextLevelXP(data.level);
  const progressPercent = Math.min(100, Math.floor((data.points % currentLevelXP) / currentLevelXP * 100));

  // Check for newly unlocked achievements
  useEffect(() => {
    const newAchievement = data.achievements.find(a => a.unlocked && a.unlockedAt &&
      new Date().getTime() - new Date(a.unlockedAt).getTime() < 5000);

    if (newAchievement) {
      setShowAchievement(newAchievement);
      setTimeout(() => {
        setShowAchievement(null);
      }, 5000);
    }
  }, [data.achievements]);

  return (
    <>
      <div>
        {/* Level Section */}
        <div className="flex flex-col items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center justify-center mb-2 w-full">
            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-2">
              {data.level}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Level {data.level}</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {Math.floor(data.points % currentLevelXP)} / {Math.floor(currentLevelXP)} XP
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress to Level {data.level + 1}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="flex justify-center mb-4">
          <button
            onClick={onAchievementsClick}
            className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors flex items-center cursor-pointer"
          >
            <span className="text-xl mr-2">🏆</span>
            <span className="font-medium">Achievements</span>
            {data.achievements.filter(a => a.unlocked).length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {data.achievements.filter(a => a.unlocked).length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-md flex items-center">
            <div className="text-xl mr-2">🔥</div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
              <div className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">{data.streak} days</div>
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/30 p-2 rounded-md flex items-center">
            <div className="text-xl mr-2">⏱️</div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Focus Time</div>
              <div className="font-bold text-rose-700 dark:text-rose-300 text-sm">
                {Math.floor(data.totalFocusTime / 3600)}h {Math.floor((data.totalFocusTime % 3600) / 60)}m
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-md flex items-center">
            <div className="text-xl mr-2">✅</div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Tasks</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{data.totalCompletedTasks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-lg shadow-lg animate-bounce z-50">
          <div className="font-bold text-lg">Level Up! 🎉</div>
          <div>You've reached Level {data.level}!</div>
        </div>
      )}

      {/* Achievement Unlocked Notification */}
      {showAchievement && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white p-4 rounded-lg shadow-lg animate-bounce z-50">
          <div className="font-bold text-lg">Achievement Unlocked! 🏆</div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">{showAchievement.icon}</span>
            <span>{showAchievement.title}</span>
          </div>
        </div>
      )}
    </>
  );
}
