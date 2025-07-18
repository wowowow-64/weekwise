
'use client';

import { useState, useEffect } from 'react';

// This custom hook is no longer the most efficient way to handle debouncing
// for our use case, but it's kept here for potential future use or reference.
// The debouncing logic has been moved directly into the WeeklyPlanner component
// for better performance by creating a stable debounced function.

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
