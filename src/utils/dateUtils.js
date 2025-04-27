/**
 * Format a date object or string to YYYY-MM-DD format
 */
export const formatDate = (date) => {
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
export const parseDate = (dateString) => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

/**
 * Add the specified number of days to a date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Format a date for display
 */
export const formatDateForDisplay = (date, format = 'long') => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }
  
  if (format === 'short') {
    const options = { month: 'short', day: 'numeric' };
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
export const isSameDay = (date1, date2) => {
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
export const getDayBoundaries = (date) => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};
