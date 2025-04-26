"use client";

import { useState, useEffect } from 'react';
import { TabSynchronization } from '../utils/tabSynchronization';

type TabSyncIndicatorProps = {
  tabSync: TabSynchronization;
};

export default function TabSyncIndicator({ tabSync }: TabSyncIndicatorProps) {
  const [activeTabsCount, setActiveTabsCount] = useState(1);
  const [isLeader, setIsLeader] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update active tabs count every second
    const interval = setInterval(() => {
      setActiveTabsCount(tabSync.getActiveTabsCount());
      setIsLeader(tabSync.isLeaderTab());
    }, 1000);

    return () => clearInterval(interval);
  }, [tabSync]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        title="Tab Synchronization Status"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <div className="flex items-center">
          <span className="mr-1">Tabs:</span>
          <span className={`font-semibold ${activeTabsCount > 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {activeTabsCount}
          </span>
        </div>
        {isLeader && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tab Synchronization</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Tabs:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{activeTabsCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Tab:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {isLeader ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    Leader
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">Follower</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tab ID:</span>
              <span className="font-mono text-xs text-gray-800 dark:text-gray-200">{tabSync.getTabId().substring(0, 8)}</span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            All tabs are synchronized. Timer actions will be reflected across all open tabs.
          </div>
        </div>
      )}
    </div>
  );
}
