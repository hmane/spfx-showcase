import { Log } from '@microsoft/sp-core-library';

/**
 * Centralized logging utility for SPFx Showcase
 * Uses SharePoint logging framework for consistent error tracking and debugging
 */

const LOG_SOURCE = 'SPFxShowcase';

/**
 * Log levels for different message types
 */
export enum LogLevel {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Verbose = 'Verbose',
}

/**
 * Logger class for centralized logging
 * Replaces console.log throughout the application
 *
 * @example
 * ```typescript
 * import { logger } from '@utils/logger';
 *
 * logger.info('Component mounted', 'CardShowcase');
 * logger.error('Failed to load data', 'FormShowcase', error);
 * logger.warning('Configuration missing', 'SPFieldsShowcase');
 * ```
 */
export class Logger {
  /**
   * Log an informational message
   *
   * @param message - The message to log
   * @param source - The component or module name (optional, defaults to LOG_SOURCE)
   * @param data - Additional data to log (optional)
   */
  public static info(message: string, source: string = LOG_SOURCE, data?: any): void {
    const logSource = `${LOG_SOURCE}:${source}`;
    if (data) {
      Log.info(logSource, `${message} - ${JSON.stringify(data)}`);
    } else {
      Log.info(logSource, message);
    }
  }

  /**
   * Log a warning message
   *
   * @param message - The warning message to log
   * @param source - The component or module name (optional, defaults to LOG_SOURCE)
   * @param data - Additional data to log (optional)
   */
  public static warning(message: string, source: string = LOG_SOURCE, data?: any): void {
    const logSource = `${LOG_SOURCE}:${source}`;
    if (data) {
      Log.warn(logSource, `${message} - ${JSON.stringify(data)}`);
    } else {
      Log.warn(logSource, message);
    }
  }

  /**
   * Log an error message
   *
   * @param message - The error message to log
   * @param source - The component or module name (optional, defaults to LOG_SOURCE)
   * @param error - The error object (optional)
   */
  public static error(message: string, source: string = LOG_SOURCE, error?: Error | any): void {
    const logSource = `${LOG_SOURCE}:${source}`;
    if (error) {
      Log.error(logSource, error instanceof Error ? error : new Error(message));
    } else {
      Log.error(logSource, new Error(message));
    }
  }

  /**
   * Log a verbose/debug message
   * Only logs in debug/development mode
   *
   * @param message - The verbose message to log
   * @param source - The component or module name (optional, defaults to LOG_SOURCE)
   * @param data - Additional data to log (optional)
   */
  public static verbose(message: string, source: string = LOG_SOURCE, data?: any): void {
    const logSource = `${LOG_SOURCE}:${source}`;
    if (data) {
      Log.verbose(logSource, `${message} - ${JSON.stringify(data)}`);
    } else {
      Log.verbose(logSource, message);
    }
  }

  /**
   * Create a scoped logger for a specific component
   * Returns an object with logging methods that automatically include the component name
   *
   * @param componentName - The name of the component
   * @returns Object with info, warning, error, and verbose methods
   *
   * @example
   * ```typescript
   * const log = Logger.createScope('CardShowcase');
   * log.info('Component mounted');
   * log.error('Failed to load', error);
   * ```
   */
  public static createScope(componentName: string) {
    return {
      info: (message: string, data?: any) => Logger.info(message, componentName, data),
      warning: (message: string, data?: any) => Logger.warning(message, componentName, data),
      error: (message: string, error?: Error | any) => Logger.error(message, componentName, error),
      verbose: (message: string, data?: any) => Logger.verbose(message, componentName, data),
    };
  }
}

/**
 * Default logger instance
 * Import and use this throughout the application
 */
export const logger = Logger;

export default logger;
