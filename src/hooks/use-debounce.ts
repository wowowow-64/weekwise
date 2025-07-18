
'use client';

// This file is no longer used and can be safely removed or ignored.
// The debouncing logic has been moved directly into the WeeklyPlanner component
// for better performance by creating a stable debounced function using useMemo.
// Keeping it for reference is fine, but it is not actively used by the application.

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
