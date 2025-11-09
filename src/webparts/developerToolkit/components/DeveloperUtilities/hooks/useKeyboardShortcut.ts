// src/components/DeveloperUtilities/hooks/useKeyboardShortcut.ts

import { useEffect } from 'react';
import { useUtilityService } from '../context/UtilityContext';

export const useKeyboardShortcut = (
  shortcuts: Map<string, () => void>,
  enabled: boolean = true
): void => {
  const utilityService = useUtilityService();

  useEffect(() => {
    if (!enabled) return;

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [shortcuts, enabled, utilityService]);
};
