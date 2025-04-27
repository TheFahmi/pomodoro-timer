"use client";

export interface TimerTheme {
  id: string;
  name: string;
  progressColor: string;
  backgroundColor: string;
  textColor: string;
  digitBgColor: string;
}

export const timerThemes: TimerTheme[] = [
  {
    id: 'default',
    name: 'Default',
    progressColor: 'text-indigo-600 dark:text-indigo-500',
    backgroundColor: 'bg-gray-200 dark:bg-gray-700',
    textColor: 'text-gray-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    progressColor: 'text-black dark:text-white',
    backgroundColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'colorful',
    name: 'Colorful',
    progressColor: 'text-gradient-to-r from-purple-500 to-pink-500',
    backgroundColor: 'bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900',
    textColor: 'text-purple-800 dark:text-purple-200',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'focus',
    name: 'Focus',
    progressColor: 'text-rose-600 dark:text-rose-500',
    backgroundColor: 'bg-slate-200 dark:bg-slate-800',
    textColor: 'text-slate-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'nature',
    name: 'Nature',
    progressColor: 'text-emerald-600 dark:text-emerald-500',
    backgroundColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    digitBgColor: 'bg-transparent'
  }
];

interface TimerThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (theme: TimerTheme) => void;
}

export default function TimerThemeSelector({
  currentThemeId,
  onThemeChange
}: TimerThemeSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Timer Theme</div>
      
      <div className="grid grid-cols-1 gap-1">
        {timerThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme)}
            className={`flex items-center px-2 py-1 text-xs rounded ${
              theme.id === currentThemeId 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center w-full">
              {theme.id === currentThemeId && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <div className={`flex items-center ${theme.id === currentThemeId ? '' : 'ml-4'}`}>
                <div className="w-4 h-4 mr-1 rounded-sm" style={{
                  backgroundColor: theme.id === 'minimalist' ? '#000' : 
                                   theme.id === 'colorful' ? '#8B5CF6' :
                                   theme.id === 'focus' ? '#E11D48' :
                                   theme.id === 'nature' ? '#10B981' : '#4F46E5'
                }}></div>
                <span className="text-xs">{theme.name}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}