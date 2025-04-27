import { useState } from 'react';

export type PomodoroTechnique = {
  id: string;
  name: string;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  description: string;
};

export const POMODORO_TECHNIQUES: PomodoroTechnique[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    description: 'Classic 25-minute work sessions with 5-minute breaks. Long break after 4 sessions.'
  },
  {
    id: 'long-focus',
    name: 'Long Focus',
    workDuration: 50,
    breakDuration: 10,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 2,
    description: 'Extended 50-minute focus sessions with 10-minute breaks. Ideal for deep work.'
  },
  {
    id: 'short-sessions',
    name: 'Short Sessions',
    workDuration: 15,
    breakDuration: 3,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 6,
    description: 'Brief 15-minute sessions with 3-minute breaks. Good for high-intensity tasks.'
  },
  {
    id: 'custom',
    name: 'Custom',
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    description: 'Your personalized Pomodoro settings.'
  }
];

type PomodoroTechniqueSelectProps = {
  currentTechniqueId: string;
  onTechniqueChange: (technique: PomodoroTechnique) => void;
  onCustomTechniqueChange?: (technique: PomodoroTechnique) => void;
};

export default function PomodoroTechniqueSelect({
  currentTechniqueId,
  onTechniqueChange,
  onCustomTechniqueChange
}: PomodoroTechniqueSelectProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTechnique, setCustomTechnique] = useState<PomodoroTechnique>({
    ...POMODORO_TECHNIQUES.find(t => t.id === 'custom')!
  });

  const handleTechniqueSelect = (techniqueId: string) => {
    const technique = POMODORO_TECHNIQUES.find(t => t.id === techniqueId);
    if (!technique) return;
    
    onTechniqueChange(technique);
    
    if (techniqueId === 'custom') {
      setShowCustomForm(true);
    } else {
      setShowCustomForm(false);
    }
  };

  const handleCustomTechniqueChange = (
    field: keyof PomodoroTechnique,
    value: PomodoroTechnique[keyof PomodoroTechnique]
  ) => {
    const updatedTechnique = { ...customTechnique, [field]: value };
    setCustomTechnique(updatedTechnique);
    
    if (onCustomTechniqueChange) {
      onCustomTechniqueChange(updatedTechnique);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTechniqueChange(customTechnique);
  };

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pomodoro Technique
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Select a Pomodoro technique that works best for your productivity style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {POMODORO_TECHNIQUES.map((technique) => (
          <div 
            key={technique.id}
            onClick={() => handleTechniqueSelect(technique.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              currentTechniqueId === technique.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">{technique.name}</h3>
              {currentTechniqueId === technique.id && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
              )}
            </div>
            
            <div className="text-sm mb-2 text-gray-600 dark:text-gray-400">
              {technique.description}
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                {technique.workDuration}m work
              </span>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                {technique.breakDuration}m break
              </span>
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                {technique.longBreakDuration}m long break
              </span>
              <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded-full">
                After {technique.sessionsBeforeLongBreak} sessions
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCustomForm && (
        <form onSubmit={handleCustomSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-3">Customize Your Technique</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="customName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technique Name
              </label>
              <input
                type="text"
                id="customName"
                value={customTechnique.name}
                onChange={(e) => handleCustomTechniqueChange('name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="My Custom Technique"
              />
            </div>
            
            <div>
              <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                id="customDescription"
                value={customTechnique.description}
                onChange={(e) => handleCustomTechniqueChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Description of your technique"
              />
            </div>
            
            <div>
              <label htmlFor="customWorkDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Duration (minutes)
              </label>
              <input
                type="number"
                id="customWorkDuration"
                min="1"
                max="120"
                value={customTechnique.workDuration}
                onChange={(e) => handleCustomTechniqueChange('workDuration', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="customBreakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                id="customBreakDuration"
                min="1"
                max="60"
                value={customTechnique.breakDuration}
                onChange={(e) => handleCustomTechniqueChange('breakDuration', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="customLongBreakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long Break Duration (minutes)
              </label>
              <input
                type="number"
                id="customLongBreakDuration"
                min="5"
                max="120"
                value={customTechnique.longBreakDuration}
                onChange={(e) => handleCustomTechniqueChange('longBreakDuration', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="customSessionsBeforeLongBreak" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sessions Before Long Break
              </label>
              <input
                type="number"
                id="customSessionsBeforeLongBreak"
                min="1"
                max="10"
                value={customTechnique.sessionsBeforeLongBreak}
                onChange={(e) => handleCustomTechniqueChange('sessionsBeforeLongBreak', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer shadow-sm transition-colors"
            >
              Apply Custom Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
