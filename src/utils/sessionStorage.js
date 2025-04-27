import { getDayBoundaries, isSameDay } from './dateUtils';

const STORAGE_KEY = 'pomodoro_sessions';

/**
 * Save a session to local storage
 */
export const saveSession = (session) => {
  const existingSessions = getAllSessions();
  
  // Create a unique ID if not provided
  if (!session.id) {
    session.id = Date.now();
  }
  
  // Add timestamp if not provided
  if (!session.timestamp) {
    session.timestamp = new Date().toISOString();
  }
  
  const sessionIndex = existingSessions.findIndex(s => s.id === session.id);
  
  if (sessionIndex >= 0) {
    // Update existing session
    existingSessions[sessionIndex] = session;
  } else {
    // Add new session
    existingSessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSessions));
  return session;
};

/**
 * Get all sessions from local storage
 */
export const getAllSessions = () => {
  const sessionsData = localStorage.getItem(STORAGE_KEY);
  if (!sessionsData) return [];
  
  try {
    return JSON.parse(sessionsData);
  } catch (error) {
    console.error('Error parsing sessions data:', error);
    return [];
  }
};

/**
 * Get sessions for a specific date
 */
export const getSessionHistoryForDate = (date) => {
  const allSessions = getAllSessions();
  const { start, end } = getDayBoundaries(date);
  
  return allSessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= start && sessionDate <= end;
  });
};

/**
 * Get sessions for the current day
 */
export const getTodaySessions = () => {
  return getSessionHistoryForDate(new Date());
};

/**
 * Get sessions for a date range
 */
export const getSessionHistoryForRange = (startDate, endDate) => {
  const allSessions = getAllSessions();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return allSessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= start && sessionDate <= end;
  });
};

/**
 * Delete a session by ID
 */
export const deleteSession = (sessionId) => {
  const existingSessions = getAllSessions();
  const filteredSessions = existingSessions.filter(session => session.id !== sessionId);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
  return filteredSessions;
};

/**
 * Clear all sessions
 */
export const clearAllSessions = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get statistics for a specific date range
 */
export const getStatistics = (startDate, endDate) => {
  const sessions = getSessionHistoryForRange(startDate, endDate);
  
  const workSessions = sessions.filter(s => s.type === 'work');
  const completedWorkSessions = workSessions.filter(s => s.completed);
  
  const totalPlannedWorkTime = workSessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  
  const totalActualWorkTime = completedWorkSessions.reduce((total, session) => {
    return total + (session.actualDuration || session.duration || 0);
  }, 0);
  
  const completionRate = workSessions.length > 0 
    ? (completedWorkSessions.length / workSessions.length) * 100 
    : 0;
    
  const breakSessions = sessions.filter(s => s.type === 'break');
  const completedBreakSessions = breakSessions.filter(s => s.completed);
  
  const totalBreakTime = completedBreakSessions.reduce((total, session) => {
    return total + (session.actualDuration || session.duration || 0);
  }, 0);
  
  return {
    totalSessions: sessions.length,
    workSessions: workSessions.length,
    completedWorkSessions: completedWorkSessions.length,
    totalPlannedWorkTime,
    totalActualWorkTime,
    completionRate,
    totalBreakTime,
    workToBreakRatio: totalBreakTime > 0 ? totalActualWorkTime / totalBreakTime : 0,
    averageSessionDuration: completedWorkSessions.length > 0 
      ? totalActualWorkTime / completedWorkSessions.length 
      : 0
  };
};
