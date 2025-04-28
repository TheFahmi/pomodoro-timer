// Workaround for react-beautiful-dnd in React 18 with Strict Mode
// Based on https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194

import { useEffect, useState } from 'react';

// This is a workaround for using react-beautiful-dnd with React 18 and StrictMode
export function useDndSafeStrictMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // We need to delay enabling the drag and drop functionality
    // until after the second render in strict mode
    const timeout = setTimeout(() => {
      setEnabled(true);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return enabled;
}

// Helper function to ensure task IDs are properly formatted for react-beautiful-dnd
export function getValidDraggableId(id: string): string {
  // Make sure the ID is a string and doesn't contain any characters that might cause issues
  return String(id).replace(/[^a-zA-Z0-9-_]/g, '-');
}
