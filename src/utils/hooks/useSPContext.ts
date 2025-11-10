import * as React from 'react';
import { SPFI } from '@pnp/sp';
import { logger } from '../logger';

/**
 * SharePoint context information interface
 */
export interface ISPContextInfo {
  siteUrl: string;
  webUrl: string;
  userDisplayName: string;
  userEmail: string;
  userLoginName: string;
  isAvailable: boolean;
}

/**
 * Hook for safe SharePoint context access
 * Provides error handling and graceful degradation when SPContext is unavailable
 *
 * @param sp - SPFI instance (optional)
 * @param pageContext - Page context from SPFx (optional)
 * @returns Object with context information and helper methods
 *
 * @example
 * ```typescript
 * const { contextInfo, isReady, getSiteUrl, getCurrentUser } = useSPContext(
 *   SPContext.sp,
 *   SPContext.pageContext
 * );
 *
 * if (isReady) {
 *   console.log('Site URL:', contextInfo.siteUrl);
 *   console.log('User:', contextInfo.userDisplayName);
 * }
 * ```
 */
export function useSPContext(sp?: SPFI, pageContext?: any) {
  const [contextInfo, setContextInfo] = React.useState<ISPContextInfo>({
    siteUrl: '',
    webUrl: '',
    userDisplayName: '',
    userEmail: '',
    userLoginName: '',
    isAvailable: false,
  });

  const [isReady, setIsReady] = React.useState(false);

  /**
   * Initialize context information
   */
  React.useEffect(() => {
    try {
      if (pageContext) {
        const info: ISPContextInfo = {
          siteUrl: pageContext.site?.absoluteUrl || '',
          webUrl: pageContext.web?.absoluteUrl || '',
          userDisplayName: pageContext.user?.displayName || '',
          userEmail: pageContext.user?.email || '',
          userLoginName: pageContext.user?.loginName || '',
          isAvailable: true,
        };

        setContextInfo(info);
        setIsReady(true);
        logger.verbose('SP Context initialized', 'useSPContext', info);
      } else {
        logger.warning('PageContext not available', 'useSPContext');
        setIsReady(true); // Still set ready to prevent blocking
      }
    } catch (error) {
      logger.error('Failed to initialize SP context', 'useSPContext', error);
      setIsReady(true);
    }
  }, [pageContext]);

  /**
   * Get site URL with fallback
   */
  const getSiteUrl = React.useCallback((): string => {
    try {
      return pageContext?.site?.absoluteUrl || contextInfo.siteUrl || '';
    } catch (error) {
      logger.warning('Failed to get site URL', 'useSPContext', error);
      return '';
    }
  }, [pageContext, contextInfo.siteUrl]);

  /**
   * Get web URL with fallback
   */
  const getWebUrl = React.useCallback((): string => {
    try {
      return pageContext?.web?.absoluteUrl || contextInfo.webUrl || '';
    } catch (error) {
      logger.warning('Failed to get web URL', 'useSPContext', error);
      return '';
    }
  }, [pageContext, contextInfo.webUrl]);

  /**
   * Get current user information with fallback
   */
  const getCurrentUser = React.useCallback((): { displayName: string; email: string; loginName: string } => {
    try {
      return {
        displayName: pageContext?.user?.displayName || contextInfo.userDisplayName || '',
        email: pageContext?.user?.email || contextInfo.userEmail || '',
        loginName: pageContext?.user?.loginName || contextInfo.userLoginName || '',
      };
    } catch (error) {
      logger.warning('Failed to get current user', 'useSPContext', error);
      return {
        displayName: '',
        email: '',
        loginName: '',
      };
    }
  }, [pageContext, contextInfo]);

  /**
   * Check if SP instance is available
   */
  const hasSP = React.useCallback((): boolean => {
    return sp !== undefined && sp !== null;
  }, [sp]);

  /**
   * Check if page context is available
   */
  const hasPageContext = React.useCallback((): boolean => {
    return pageContext !== undefined && pageContext !== null;
  }, [pageContext]);

  /**
   * Safe async operation wrapper
   * Executes operation only if SP is available, otherwise logs warning
   */
  const executeSafe = React.useCallback(async <T,>(
    operation: (spInstance: SPFI) => Promise<T>,
    fallbackValue: T,
    operationName: string = 'operation'
  ): Promise<T> => {
    try {
      if (!sp) {
        logger.warning(`SP not available for ${operationName}`, 'useSPContext');
        return fallbackValue;
      }

      return await operation(sp);
    } catch (error) {
      logger.error(`Error in ${operationName}`, 'useSPContext', error);
      return fallbackValue;
    }
  }, [sp]);

  return {
    contextInfo,
    isReady,
    getSiteUrl,
    getWebUrl,
    getCurrentUser,
    hasSP,
    hasPageContext,
    executeSafe,
    sp,
    pageContext,
  };
}

export default useSPContext;
