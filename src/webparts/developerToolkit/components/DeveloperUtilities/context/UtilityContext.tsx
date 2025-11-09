// src/components/DeveloperUtilities/context/UtilityContext.tsx

import * as React from 'react';
import { UtilityService } from '../services/UtilityService';

interface UtilityContextValue {
  utilityService: UtilityService;
}

const UtilityContext = React.createContext<UtilityContextValue | undefined>(undefined);

export const UtilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const utilityServiceRef = React.useRef<UtilityService>(UtilityService.getInstance());

  React.useEffect(() => {
    const service = utilityServiceRef.current;
    return () => {
      service.clearAllTimeouts();
    };
  }, []);

  const value = React.useMemo(
    () => ({
      utilityService: utilityServiceRef.current,
    }),
    []
  );

  return <UtilityContext.Provider value={value}>{children}</UtilityContext.Provider>;
};

export const useUtilityService = (): UtilityService => {
  const context = React.useContext(UtilityContext);
  if (!context) {
    throw new Error('useUtilityService must be used within UtilityProvider');
  }
  return context.utilityService;
};
