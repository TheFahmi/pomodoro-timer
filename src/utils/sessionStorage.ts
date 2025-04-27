import { getDayBoundaries } from './dateUtils';

const STORAGE_KEY = 'pomodoro_sessions';

export type Session = {
  id: number;
  timestamp: string;
  type: 'work' | 'break';
  duration?: number;
  actualDuration?: number;
  completed?: boolean;
};

export const saveSession = (session: Partial<Session>): Session => {
  const existingSessions = getAllSessions();
  if (!session.id) {
    session.id = Date.now();
  }
  if (!session.timestamp) {
    session.timestamp = new Date().toISOString();
  }
  const sessionIndex = existingSessions.findIndex((s) => s.id === session.id);
  if (sessionIndex >= 0) {
    existingSessions[sessionIndex] = session as Session;
  } else {
    existingSessions.push(session as Session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSessions));
  return session as Session;
};

export const getAllSessions = (): Session[] => {
  const sessionsData = localStorage.getItem(STORAGE_KEY);
  if (!sessionsData) return [];
  try {
    return JSON.parse(sessionsData) as Session[];
  } catch (error) {
    console.error('Error parsing sessions data:', error);
    return [];
  }
};

export const getSessionHistoryForDate = (date: Date | string): Session[] => {
  const allSessions = getAllSessions();
  const { start, end } = getDayBoundaries(date);
  return allSessions.filter((session) => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= start && sessionDate <= end;
  });
};

export const getTodaySessions = (): Session[] => {
  return getSessionHistoryForDate(new Date());
};

export const getSessionHistoryForRange = (startDate: Date | string, endDate: Date | string): Session[] => {
  const allSessions = getAllSessions();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return allSessions.filter((session) => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= start && sessionDate <= end;
  });
};

export const deleteSession = (sessionId: number): Session[] => {
  const existingSessions = getAllSessions();
  const filteredSessions = existingSessions.filter((session) => session.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
  return filteredSessions;
};

export const clearAllSessions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export type Statistics = {
  totalSessions: number;
  workSessions: number;
  completedWorkSessions: number;
  totalPlannedWorkTime: number;
  totalActualWorkTime: number;
  completionRate: number;
  totalBreakTime: number;
  workToBreakRatio: number;
  averageSessionDuration: number;
};

export const getStatistics = (startDate: Date | string, endDate: Date | string): Statistics => {
  const sessions = getSessionHistoryForRange(startDate, endDate);
  const workSessions = sessions.filter((s) => s.type === 'work');
  const completedWorkSessions = workSessions.filter((s) => s.completed);
  const totalPlannedWorkTime = workSessions.reduce((total, session) => total + (session.duration || 0), 0);
  const totalActualWorkTime = completedWorkSessions.reduce((total, session) => total + (session.actualDuration || session.duration || 0), 0);
  const completionRate = workSessions.length > 0 ? (completedWorkSessions.length / workSessions.length) * 100 : 0;
  const breakSessions = sessions.filter((s) => s.type === 'break');
  const completedBreakSessions = breakSessions.filter((s) => s.completed);
  const totalBreakTime = completedBreakSessions.reduce((total, session) => total + (session.actualDuration || session.duration || 0), 0);
  return {
    totalSessions: sessions.length,
    workSessions: workSessions.length,
    completedWorkSessions: completedWorkSessions.length,
    totalPlannedWorkTime,
    totalActualWorkTime,
    completionRate,
    totalBreakTime,
    workToBreakRatio: totalBreakTime > 0 ? totalActualWorkTime / totalBreakTime : 0,
    averageSessionDuration: completedWorkSessions.length > 0 ? totalActualWorkTime / completedWorkSessions.length : 0,
  };
};
