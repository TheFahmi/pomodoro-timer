import React from "react";

interface HealthReminderProps {
  isBreak: boolean;
}

const reminderIcons: Record<string, React.ReactNode> = {
  stretch: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-600 dark:text-cyan-400">
      <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.2" />
      <path d="M18 12a1 1 0 00-1-1h-4V7a1 1 0 00-2 0v4H7a1 1 0 000 2h4v4a1 1 0 002 0v-4h4a1 1 0 001-1z" fill="currentColor" />
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  eyeRest: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-600 dark:text-cyan-400">
      <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.2" />
      <path d="M2 12s3.636-6 10-6 10 6 10 6-3.636 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  hydration: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-600 dark:text-cyan-400">
      <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 21a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 10.1 5 12 5 14a7 7 0 007 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
};

const reminders = [
  {
    key: "stretch",
    text: "Do some light stretching to reduce muscle tension.",
  },
  {
    key: "eyeRest",
    text: "Rest your eyes by looking into the distance for 20 seconds.",
  },
  {
    key: "hydration",
    text: "Drink water to stay hydrated.",
  },
];

const HealthReminder: React.FC<HealthReminderProps> = ({ isBreak }) => {
  if (!isBreak) return null;
  return (
    <div className="bg-cyan-50 dark:bg-cyan-900 border border-cyan-200 dark:border-cyan-700 rounded-lg p-4 my-6 shadow-md max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-cyan-800 dark:text-cyan-200 mb-3 text-center">Health Reminder</h3>
      <ul className="space-y-3 px-2">
        {reminders.map(r => (
          <li
            key={r.key}
            className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-cyan-100 dark:border-cyan-800"
          >
            <span className="flex-shrink-0 mr-3">{reminderIcons[r.key]}</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium text-base">{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthReminder;
