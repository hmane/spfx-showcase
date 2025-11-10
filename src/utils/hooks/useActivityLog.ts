import * as React from 'react';
import { logger } from '../logger';

/**
 * Log entry interface
 */
export interface ILogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}

/**
 * Hook for managing activity logs
 * Centralized pattern used across multiple demos (ManageAccess, VersionHistory, ErrorBoundary)
 *
 * @param maxEntries - Maximum number of log entries to keep (default: 100)
 * @returns Object with logs array and log management functions
 *
 * @example
 * ```typescript
 * const { logs, addLog, clearLogs, getLogsByType } = useActivityLog();
 *
 * addLog('Operation started', 'info');
 * addLog('Success!', 'success', { itemId: 123 });
 * addLog('Warning: Something happened', 'warning');
 *
 * const errors = getLogsByType('error');
 * ```
 */
export function useActivityLog(maxEntries: number = 100) {
  const [logs, setLogs] = React.useState<ILogEntry[]>([]);

  /**
   * Add a new log entry
   */
  const addLog = React.useCallback((
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    data?: any
  ) => {
    const entry: ILogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      message,
      type,
      data,
    };

    setLogs(prevLogs => {
      const newLogs = [entry, ...prevLogs];
      // Keep only max entries
      if (newLogs.length > maxEntries) {
        return newLogs.slice(0, maxEntries);
      }
      return newLogs;
    });

    // Also log to SharePoint logger
    switch (type) {
      case 'info':
        logger.info(message, 'ActivityLog', data);
        break;
      case 'success':
        logger.info(`✓ ${message}`, 'ActivityLog', data);
        break;
      case 'warning':
        logger.warning(message, 'ActivityLog', data);
        break;
      case 'error':
        logger.error(message, 'ActivityLog', data);
        break;
    }
  }, [maxEntries]);

  /**
   * Clear all logs
   */
  const clearLogs = React.useCallback(() => {
    logger.verbose('Clearing activity logs', 'useActivityLog');
    setLogs([]);
  }, []);

  /**
   * Get logs filtered by type
   */
  const getLogsByType = React.useCallback((type: 'info' | 'success' | 'warning' | 'error') => {
    return logs.filter(log => log.type === type);
  }, [logs]);

  /**
   * Get logs from the last N minutes
   */
  const getRecentLogs = React.useCallback((minutes: number) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return logs.filter(log => log.timestamp >= cutoff);
  }, [logs]);

  /**
   * Remove a specific log entry by ID
   */
  const removeLog = React.useCallback((logId: string) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
  }, []);

  /**
   * Export logs as JSON string
   */
  const exportLogs = React.useCallback(() => {
    return JSON.stringify(logs, null, 2);
  }, [logs]);

  /**
   * Get log statistics
   */
  const getStats = React.useCallback(() => {
    return {
      total: logs.length,
      info: logs.filter(l => l.type === 'info').length,
      success: logs.filter(l => l.type === 'success').length,
      warning: logs.filter(l => l.type === 'warning').length,
      error: logs.filter(l => l.type === 'error').length,
    };
  }, [logs]);

  return {
    logs,
    addLog,
    clearLogs,
    getLogsByType,
    getRecentLogs,
    removeLog,
    exportLogs,
    getStats,
  };
}

export default useActivityLog;
