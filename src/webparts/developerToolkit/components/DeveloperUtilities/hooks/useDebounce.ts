// src/components/DeveloperUtilities/hooks/useDebounce.ts

import { useCallback, useEffect, useRef } from 'react';

export const useDebounce = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | undefined>(undefined);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = undefined;
      }, delay);
    },
    [delay]
  );

  return debouncedCallback;
};
