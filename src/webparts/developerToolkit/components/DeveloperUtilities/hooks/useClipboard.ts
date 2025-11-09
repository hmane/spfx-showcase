// src/components/DeveloperUtilities/hooks/useClipboard.ts

import { useCallback, useState } from 'react';
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

  const clearMessage = useCallback(() => {
    setShowMessage(false);
    setCopyMessage('');
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, successMessage?: string): Promise<void> => {
      const result = await utilityService.copyToClipboard(text);
      setCopyMessage(successMessage || result.message);
      setShowMessage(true);

      utilityService.createManagedTimeout(() => {
        setShowMessage(false);
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
