"use client";

import { useState, useEffect } from 'react';
import { SessionHistory } from './PomodoroApp';
import { motion, AnimatePresence } from 'framer-motion';

type SessionNotesProps = {
  sessionHistory: SessionHistory[];
  onAddNote: (sessionId: number, note: string) => void;
  onAddReflection: (sessionId: number, reflection: string) => void;
  currentSession?: number; // Index of the current session to show reflection prompt for
  isReflectionPromptOpen: boolean;
  onCloseReflectionPrompt: () => void;
};

export default function SessionNotes({
  sessionHistory,
  onAddNote,
  onAddReflection,
  currentSession,
  isReflectionPromptOpen,
  onCloseReflectionPrompt,
}: SessionNotesProps) {
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [expandedSessions, setExpandedSessions] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'focus' | 'break'>('all');

  // Reset note text when active session changes
  useEffect(() => {
    if (activeSession !== null) {
      const session = sessionHistory[activeSession];
      setNoteText(session.notes || '');
    } else {
      setNoteText('');
    }
  }, [activeSession, sessionHistory]);

  // Reset reflection text when current session changes
  useEffect(() => {
    if (currentSession !== undefined) {
      setReflectionText('');
    }
  }, [currentSession]);

  const handleSaveNote = () => {
    if (activeSession !== null && noteText.trim()) {
      onAddNote(activeSession, noteText.trim());
      setActiveSession(null);
    }
  };

  const handleSaveReflection = () => {
    if (currentSession !== undefined && reflectionText.trim()) {
      onAddReflection(currentSession, reflectionText.trim());
      setReflectionText('');
      onCloseReflectionPrompt();
    }
  };

  const toggleSessionExpanded = (index: number) => {
    setExpandedSessions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const filteredSessions = sessionHistory.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'focus') return session.type === 'pomodoro';
    if (filter === 'break') return session.type === 'shortBreak' || session.type === 'longBreak';
    return true;
  });

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
          Session Notes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Add notes and reflections to your Pomodoro sessions to track your thoughts and progress.
        </p>
      </div>

      {/* Filter controls */}
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-md ${
            filter === 'all'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Sessions
        </button>
        <button
          onClick={() => setFilter('focus')}
          className={`px-3 py-1 text-sm rounded-md ${
            filter === 'focus'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Focus Sessions
        </button>
        <button
          onClick={() => setFilter('break')}
          className={`px-3 py-1 text-sm rounded-md ${
            filter === 'break'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Break Sessions
        </button>
      </div>

      {/* Session list */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredSessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No sessions yet. Complete a Pomodoro session to add notes.
          </p>
        ) : (
          filteredSessions.map((session, index) => {
            const isExpanded = expandedSessions.includes(index);
            const actualIndex = sessionHistory.findIndex(s => s === session);
            
            return (
              <div 
                key={index} 
                className={`p-3 rounded-lg transition-colors ${
                  session.type === 'pomodoro'
                    ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30'
                    : session.type === 'shortBreak'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30'
                    : 'bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30'
                }`}
              >
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSessionExpanded(index)}>
                  <div className="flex items-center">
                    {session.type === 'pomodoro' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : session.type === 'shortBreak' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    )}
                    <div>
                      <div className="font-medium">
                        {session.type === 'pomodoro' ? 'Focus Session' : session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        {session.task && <span className="ml-2 text-gray-600 dark:text-gray-400">- {session.task}</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {session.timestamp.toLocaleDateString()} {session.timestamp.toLocaleTimeString()} 
                        {session.completed ? ' • Completed' : ' • Incomplete'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {(session.notes || session.reflection) && (
                      <span className="mr-2 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full">
                        {session.notes && session.reflection ? 'Notes & Reflection' : session.notes ? 'Notes' : 'Reflection'}
                      </span>
                    )}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      {/* Notes section */}
                      {activeSession === actualIndex ? (
                        <div className="mb-3">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your notes for this session..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                            rows={4}
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => setActiveSession(null)}
                              className="px-3 py-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveNote}
                              className="px-3 py-1 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                              disabled={!noteText.trim()}
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Notes</h4>
                            <button
                              onClick={() => setActiveSession(actualIndex)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              {session.notes ? 'Edit' : 'Add Notes'}
                            </button>
                          </div>
                          {session.notes ? (
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap bg-white/50 dark:bg-gray-700/50 p-2 rounded-md">
                              {session.notes}
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                              No notes added for this session.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Reflection section */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">Reflection</h4>
                          {session.reflection && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Added after session
                            </span>
                          )}
                        </div>
                        {session.reflection ? (
                          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap bg-white/50 dark:bg-gray-700/50 p-2 rounded-md">
                            {session.reflection}
                          </p>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                            No reflection added for this session.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Reflection prompt modal */}
      <AnimatePresence>
        {isReflectionPromptOpen && currentSession !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onCloseReflectionPrompt}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Session Reflection
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Take a moment to reflect on your {sessionHistory[currentSession]?.type === 'pomodoro' ? 'focus' : 'break'} session.
                What went well? What could be improved?
              </p>
              
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Enter your reflection..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                rows={5}
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={onCloseReflectionPrompt}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveReflection}
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  disabled={!reflectionText.trim()}
                >
                  Save Reflection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
