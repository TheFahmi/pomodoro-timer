"use client";

import { useState, useEffect, useCallback } from 'react';

type MotivationalQuoteProps = {
  isBreak: boolean;
};

// Array of motivational quotes
const QUOTES = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  }
];

// Array of break time messages
const BREAK_MESSAGES = [
  "Take a deep breath and relax.",
  "Stand up and stretch a bit.",
  "Rest your eyes for a moment.",
  "Hydrate yourself with some water.",
  "Take a moment to reflect on your progress.",
  "Clear your mind before the next session.",
  "A short break improves productivity.",
  "Use this time to reset your focus.",
  "Small breaks lead to big accomplishments.",
  "Recharge your energy for the next round."
];

export default function MotivationalQuote({ isBreak }: MotivationalQuoteProps) {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  // Get a random quote or break message
  const getRandomMessage = useCallback(() => {
    if (isBreak) {
      const randomBreakMessage = BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];
      setQuote(randomBreakMessage);
      setAuthor('');
    } else {
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(randomQuote.text);
      setAuthor(randomQuote.author);
    }
  }, [isBreak]);

  // Update quote when isBreak changes
  useEffect(() => {
    setFadeIn(false);
    
    // Small delay before changing the quote to allow fade out
    const timeout = setTimeout(() => {
      getRandomMessage();
      setFadeIn(true);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [getRandomMessage, isBreak]);

  // Initial quote on mount
  useEffect(() => {
    getRandomMessage();
    setFadeIn(true);
  }, [getRandomMessage]);

  // Get a new quote when clicked
  const handleClick = () => {
    setFadeIn(false);
    
    // Small delay before changing the quote to allow fade out
    setTimeout(() => {
      getRandomMessage();
      setFadeIn(true);
    }, 500);
  };

  if (!quote) return null;

  return (
    <div 
      className={`mt-6 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-opacity duration-500 cursor-pointer ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{quote}</p>
          {author && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">— {author}</p>
          )}
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 italic">Click for another message</p>
        </div>
      </div>
    </div>
  );
}

