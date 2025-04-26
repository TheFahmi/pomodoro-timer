"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
}

interface CalendarIntegrationProps {
  onEventSelect: (eventTitle: string) => void;
}

export default function CalendarIntegration({ onEventSelect }: CalendarIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Mock function to fetch calendar events
  // In a real app, this would connect to Google Calendar, Outlook, etc.
  const fetchCalendarEvents = async (date: Date) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock events for the selected date
    const mockEvents: CalendarEvent[] = [];
    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0, 0);
    
    // Add some mock events
    mockEvents.push({
      id: '1',
      title: 'Team Meeting',
      start: new Date(dayStart.getTime() + 1 * 60 * 60 * 1000), // 10:00 AM
      end: new Date(dayStart.getTime() + 2 * 60 * 60 * 1000),   // 11:00 AM
      allDay: false,
      color: '#3b82f6' // Blue
    });
    
    mockEvents.push({
      id: '2',
      title: 'Project Planning',
      start: new Date(dayStart.getTime() + 3 * 60 * 60 * 1000), // 12:00 PM
      end: new Date(dayStart.getTime() + 4 * 60 * 60 * 1000),   // 1:00 PM
      allDay: false,
      color: '#10b981' // Green
    });
    
    mockEvents.push({
      id: '3',
      title: 'Client Call',
      start: new Date(dayStart.getTime() + 6 * 60 * 60 * 1000), // 3:00 PM
      end: new Date(dayStart.getTime() + 6.5 * 60 * 60 * 1000), // 3:30 PM
      allDay: false,
      color: '#f59e0b' // Amber
    });
    
    // Add a random event
    const randomHour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
    const randomDuration = Math.random() < 0.5 ? 0.5 : 1; // 30 min or 1 hour
    
    mockEvents.push({
      id: '4',
      title: 'Focus Session',
      start: new Date(dayStart.getTime() + randomHour * 60 * 60 * 1000),
      end: new Date(dayStart.getTime() + (randomHour + randomDuration) * 60 * 60 * 1000),
      allDay: false,
      color: '#8b5cf6' // Purple
    });
    
    // Sort events by start time
    mockEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    setEvents(mockEvents);
    setIsLoading(false);
  };
  
  // Connect to calendar
  const connectCalendar = () => {
    setIsLoading(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      fetchCalendarEvents(selectedDate);
    }, 1500);
  };
  
  // Disconnect from calendar
  const disconnectCalendar = () => {
    setIsConnected(false);
    setEvents([]);
  };
  
  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    if (isConnected) {
      fetchCalendarEvents(date);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    handleDateChange(prevDay);
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    handleDateChange(nextDay);
  };
  
  // Handle event selection
  const handleEventSelect = (event: CalendarEvent) => {
    onEventSelect(event.title);
    setIsOpen(false);
  };
  
  // Load events when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchCalendarEvents(selectedDate);
    }
  }, [isConnected, selectedDate]);
  
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendar
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Calendar Events</h3>
              
              {!isConnected ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Connect your calendar to see upcoming events and create focus sessions.
                  </p>
                  
                  <button
                    onClick={connectCalendar}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Calendar'}
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPreviousDay}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedDate)}
                    </div>
                    
                    <button
                      onClick={goToNextDay}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : events.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {events.map(event => (
                        <motion.div
                          key={event.id}
                          className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleEventSelect(event)}
                        >
                          <div className="flex items-start">
                            <div
                              className="w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0"
                              style={{ backgroundColor: event.color || '#6366f1' }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {event.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {event.allDay
                                  ? 'All day'
                                  : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
                      No events scheduled for this day.
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <button
                      onClick={disconnectCalendar}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer"
                    >
                      Disconnect
                    </button>
                    
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
