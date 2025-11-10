import * as React from 'react';
import { logger } from '../logger';

/**
 * Configuration state interface
 * Generic type allows for flexible configuration objects
 */
export interface IConfigPanelState<T = any> {
  isOpen: boolean;
  config: T;
}

/**
 * Hook for managing collapsible configuration panel state
 * Provides consistent state management across all demos
 *
 * @param initialConfig - Initial configuration object
 * @param defaultOpen - Whether panel starts open (default: false)
 * @param storageKey - Optional localStorage key to persist panel state
 * @returns Object with panel state and management functions
 *
 * @example
 * ```typescript
 * interface MyConfig {
 *   showTitle: boolean;
 *   maxItems: number;
 * }
 *
 * const {
 *   isOpen,
 *   config,
 *   togglePanel,
 *   updateConfig,
 *   resetConfig
 * } = useConfigPanel<MyConfig>({
 *   showTitle: true,
 *   maxItems: 10
 * });
 *
 * <ConfigurationPanel
 *   isOpen={isOpen}
 *   onToggle={togglePanel}
 * >
 *   <Toggle
 *     checked={config.showTitle}
 *     onChange={(e, checked) => updateConfig({ showTitle: checked })}
 *   />
 * </ConfigurationPanel>
 * ```
 */
export function useConfigPanel<T = any>(
  initialConfig: T,
  defaultOpen: boolean = false,
  storageKey?: string
) {
  // Try to load initial state from localStorage if key provided
  const getInitialState = React.useCallback((): IConfigPanelState<T> => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          logger.verbose('Loaded config from storage', 'useConfigPanel', { storageKey });
          return {
            isOpen: parsed.isOpen ?? defaultOpen,
            config: { ...initialConfig, ...parsed.config },
          };
        }
      } catch (error) {
        logger.warning('Failed to load config from storage', 'useConfigPanel', error);
      }
    }

    return {
      isOpen: defaultOpen,
      config: initialConfig,
    };
  }, [initialConfig, defaultOpen, storageKey]);

  const [state, setState] = React.useState<IConfigPanelState<T>>(getInitialState);

  /**
   * Save state to localStorage if key provided
   */
  const saveToStorage = React.useCallback((newState: IConfigPanelState<T>) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
        logger.verbose('Saved config to storage', 'useConfigPanel', { storageKey });
      } catch (error) {
        logger.warning('Failed to save config to storage', 'useConfigPanel', error);
      }
    }
  }, [storageKey]);

  /**
   * Toggle panel open/closed
   */
  const togglePanel = React.useCallback(() => {
    setState(prev => {
      const newState = { ...prev, isOpen: !prev.isOpen };
      saveToStorage(newState);
      logger.verbose(`Config panel ${newState.isOpen ? 'opened' : 'closed'}`, 'useConfigPanel');
      return newState;
    });
  }, [saveToStorage]);

  /**
   * Open panel
   */
  const openPanel = React.useCallback(() => {
    setState(prev => {
      if (prev.isOpen) return prev;
      const newState = { ...prev, isOpen: true };
      saveToStorage(newState);
      logger.verbose('Config panel opened', 'useConfigPanel');
      return newState;
    });
  }, [saveToStorage]);

  /**
   * Close panel
   */
  const closePanel = React.useCallback(() => {
    setState(prev => {
      if (!prev.isOpen) return prev;
      const newState = { ...prev, isOpen: false };
      saveToStorage(newState);
      logger.verbose('Config panel closed', 'useConfigPanel');
      return newState;
    });
  }, [saveToStorage]);

  /**
   * Update configuration (partial update)
   */
  const updateConfig = React.useCallback((updates: Partial<T>) => {
    setState(prev => {
      const newState = {
        ...prev,
        config: { ...prev.config, ...updates },
      };
      saveToStorage(newState);
      logger.verbose('Config updated', 'useConfigPanel', updates);
      return newState;
    });
  }, [saveToStorage]);

  /**
   * Replace entire configuration
   */
  const setConfig = React.useCallback((newConfig: T) => {
    setState(prev => {
      const newState = {
        ...prev,
        config: newConfig,
      };
      saveToStorage(newState);
      logger.verbose('Config replaced', 'useConfigPanel', newConfig);
      return newState;
    });
  }, [saveToStorage]);

  /**
   * Reset configuration to initial values
   */
  const resetConfig = React.useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        config: initialConfig,
      };
      saveToStorage(newState);
      logger.verbose('Config reset to initial', 'useConfigPanel');
      return newState;
    });
  }, [initialConfig, saveToStorage]);

  /**
   * Reset everything (config and panel state)
   */
  const reset = React.useCallback(() => {
    const newState = {
      isOpen: defaultOpen,
      config: initialConfig,
    };
    setState(newState);
    saveToStorage(newState);
    logger.verbose('Config panel fully reset', 'useConfigPanel');
  }, [defaultOpen, initialConfig, saveToStorage]);

  /**
   * Get a specific config value
   */
  const getConfigValue = React.useCallback(<K extends keyof T>(key: K): T[K] => {
    return state.config[key];
  }, [state.config]);

  return {
    isOpen: state.isOpen,
    config: state.config,
    togglePanel,
    openPanel,
    closePanel,
    updateConfig,
    setConfig,
    resetConfig,
    reset,
    getConfigValue,
  };
}

export default useConfigPanel;
