// src/components/DeveloperUtilities/hooks/useClipboard.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUtilityService } from '../context/UtilityContext';

interface UseClipboardReturn {
  copyToClipboard: (text: string, successMessage?: string) => Promise<void>;
  copyMessage: string;
  showMessage: boolean;
  clearMessage: () => void;
}

export const useClipboard = (autoHideDuration: number = 3000): UseClipboardReturn => {
  const utilityService = useUtilityService();
  const [copyMessage, setCopyMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const timeoutCleanupRef = useRef<(() => void) | null>(null);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup any pending timeout
      if (timeoutCleanupRef.current) {
        timeoutCleanupRef.current();
        timeoutCleanupRef.current = null;
      }
    };
  }, []);

  const clearMessage = useCallback(() => {
    setShowMessage(false);
    setCopyMessage('');
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, successMessage?: string): Promise<void> => {
      const result = await utilityService.copyToClipboard(text);

      // Only update state if still mounted
      if (!isMountedRef.current) return;

      setCopyMessage(successMessage || result.message);
      setShowMessage(true);

      // Clear any existing timeout before setting a new one
      if (timeoutCleanupRef.current) {
        timeoutCleanupRef.current();
      }

      timeoutCleanupRef.current = utilityService.createManagedTimeout(() => {
        // Only update state if still mounted
        if (isMountedRef.current) {
          setShowMessage(false);
        }
      }, autoHideDuration);
    },
    [utilityService, autoHideDuration]
  );

  return {
    copyToClipboard,
    copyMessage,
    showMessage,
    clearMessage,
  };
};
