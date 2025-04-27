/**
 * Format a date object or string to YYYY-MM-DD format
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string into a Date object
 */
export const parseDate = (dateString: string | undefined): Date => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

/**
 * Add the specified number of days to a date
 */
export const addDays = (date: Date | string, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Format a date for display
 */
export const formatDateForDisplay = (
  date: Date | string | undefined,
  format: 'long' | 'short' | 'time' = 'long'
): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'long') {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }
  if (format === 'short') {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }
  if (format === 'time') {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
};

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Get start and end of a day
 */
export const getDayBoundaries = (date: Date | string): { start: Date; end: Date } => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Calculate the number of days between two dates
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @param {{ absolute?: boolean }} options  default: { absolute: true }
 * @returns {number} whole‑day difference
 */
export const diffInDays = (
  date1: Date | string,
  date2: Date | string,
  options: { absolute?: boolean } = {}
): number => {
  const { absolute = true } = options;
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  return absolute ? Math.abs(Math.floor(diff)) : Math.floor(diff);
};

/**
 * Get the start (00:00) and end (23:59:59.999) of the ISO‑week
 * containing the given date. `startOfWeek` is 0 (Sunday)‑6 (Saturday),
 * defaulting to 1 (Monday).
 */
export const getWeekBoundaries = (
  date: Date | string,
  startOfWeek: number = 1
): { start: Date; end: Date } => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  // days to subtract to reach week start
  const diffToStart = (day < startOfWeek ? 7 : 0) + day - startOfWeek;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};
