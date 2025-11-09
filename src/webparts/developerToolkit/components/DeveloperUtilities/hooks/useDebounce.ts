// src/components/DeveloperUtilities/hooks/useDebounce.ts

import { useEffect, useRef } from 'react';
import { useUtilityService } from '../context/UtilityContext';

export const useDebounce = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const utilityService = useUtilityService();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useRef(
    utilityService.debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay)
  );

  return debouncedCallback.current;
};
