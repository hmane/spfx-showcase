import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';
import * as React from 'react';
import { useCallback, useState } from 'react';

import {
  ERROR_BOUNDARY_CONFIGS,
  ErrorBoundary,
  useErrorHandler,
} from 'spfx-toolkit/components/ErrorBoundary';
import type { IErrorDetails, IErrorInfo } from 'spfx-toolkit/components/ErrorBoundary';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const ERROR_BOUNDARY_SAMPLE = `import * as React from 'react';
import {
  ErrorBoundary,
  ERROR_BOUNDARY_CONFIGS,
  useErrorHandler,
} from 'spfx-toolkit/components/ErrorBoundary';

const RiskyWidget: React.FC = () => {
  const { captureError } = useErrorHandler();

  const handleClick = async () => {
    try {
      await doSomethingAsync();
    } catch (error) {
      captureError(error as Error);
    }
  };

  return <button onClick={handleClick}>Run risky action</button>;
};

export const WidgetWithBoundary: React.FC = () => (
  <ErrorBoundary
    {...ERROR_BOUNDARY_CONFIGS.STANDARD}
    onError={(error, info, details) => {
      console.error(details.category, details.severity, error);
    }}
  >
    <RiskyWidget />
  </ErrorBoundary>
);`;

const ERROR_BOUNDARY_FEATURES: ShowcaseFeature[] = [
  {
    icon: '🎯',
    title: 'Smart Classification',
    description:
      'Automatically categorizes errors by severity and type (network, permission, component, etc.).',
    color: '#dc3545',
  },
  {
    icon: '🔁',
    title: 'Retry Intelligence',
    description: 'Only retries recoverable errors with exponential backoff and helpful messaging.',
    color: '#107c10',
  },
  {
    icon: '♿',
    title: 'Accessibility First',
    description:
      'WCAG-compliant alerts, focus management, and keyboard-friendly recovery controls.',
    color: '#8764b8',
  },
  {
    icon: '📊',
    title: 'SPFx Context',
    description: 'Captures SharePoint context details to enrich telemetry and audit trails.',
    color: '#0078d4',
  },
];

const ERROR_BOUNDARY_BADGES = [
  'Smart error recovery',
  'Render + async protection',
  'Telemetry ready',
];

// ============================================================================
// Types
// ============================================================================

interface IErrorTriggerProps {
  errorType: 'render' | 'async' | 'network' | 'permission';
  title: string;
  description: string;
  buttonText: string;
  icon: string;
}

// ============================================================================
// Error Trigger Component
// ============================================================================

const ErrorTriggerInner: React.FC<{ errorType: 'render'; title: string }> = ({
  errorType,
  title,
}) => {
  throw new Error(`${title}: Component failed to render properly`);
};

const ErrorTrigger: React.FC<IErrorTriggerProps> = ({
  errorType,
  title,
  description,
  buttonText,
  icon,
}) => {
  const [shouldError, setShouldError] = useState(false);
  const { captureError } = useErrorHandler();

  const triggerAsyncError = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (errorType) {
      case 'async':
        captureError(new Error(`${title}: Async operation failed unexpectedly`));
        break;
      case 'network':
        captureError(new Error(`${title}: Failed to fetch data from server`));
        break;
      case 'permission':
        captureError(new Error(`${title}: Access denied - insufficient permissions`));
        break;
      default:
        captureError(new Error(`${title}: Unknown error occurred`));
        break;
    }
  }, [errorType, title, captureError]);

  const handleTriggerError = (): void => {
    if (errorType === 'render') {
      setShouldError(true);
    } else {
      triggerAsyncError().catch(() => undefined);
    }
  };

  if (shouldError && errorType === 'render') {
    return <ErrorTriggerInner errorType={errorType} title={title} />;
  }

  return (
    <div
      style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '2px solid #e9ecef',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>{icon}</div>
      <Text
        variant='large'
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 600,
          color: '#323130',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        variant='medium'
        style={{
          display: 'block',
          marginBottom: '20px',
          color: '#605e5c',
          lineHeight: '1.5',
          textAlign: 'center',
          flex: 1,
        }}
      >
        {description}
      </Text>
      <DefaultButton
        text={buttonText}
        onClick={handleTriggerError}
        iconProps={{ iconName: 'Warning' }}
        styles={{
          root: {
            width: '100%',
            height: '40px',
            borderRadius: '6px',
          },
        }}
      />
    </div>
  );
};

// ============================================================================
// Hook-based Component
// ============================================================================

const HookBasedDemo: React.FC = () => {
  const { captureError, resetError } = useErrorHandler();
  const [attemptCount, setAttemptCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const performRiskyOperation = useCallback(async () => {
    try {
      setIsProcessing(true);
      setAttemptCount(prev => prev + 1);
      resetError();

      await new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            reject(new Error(`Operation failed on attempt ${attemptCount + 1}`));
          } else {
            resolve('success');
          }
        }, 600);
      });

      setIsProcessing(false);
      alert('Operation succeeded!');
    } catch (error) {
      setIsProcessing(false);
      captureError(error as Error);
    }
  }, [captureError, resetError, attemptCount]);

  return (
    <div
      style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '2px solid #e9ecef',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎲</div>
      <Text
        variant='large'
        style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#323130' }}
      >
        Hook-Based Error Handling
      </Text>
      <Text
        variant='medium'
        style={{ display: 'block', marginBottom: '16px', color: '#605e5c', lineHeight: '1.5' }}
      >
        Uses useErrorHandler for async operations. Random success/failure.
      </Text>
      <div style={{ marginBottom: '16px', fontSize: '13px', color: '#605e5c', flex: 1 }}>
        Attempts: {attemptCount}
      </div>
      <PrimaryButton
        text={isProcessing ? 'Processing...' : 'Run Random Operation'}
        onClick={performRiskyOperation}
        disabled={isProcessing}
        iconProps={{ iconName: 'CloudUpload' }}
        styles={{
          root: {
            width: '100%',
            height: '40px',
            borderRadius: '6px',
          },
        }}
      />
    </div>
  );
};

// ============================================================================
// Main Showcase Component
// ============================================================================

export const ErrorBoundaryShowcase: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const handleGlobalError = useCallback(
    (error: Error, errorInfo: IErrorInfo, errorDetails: IErrorDetails) => {
      const logEntry = `[${errorDetails.timestamp.toLocaleTimeString()}] ${errorDetails.severity.toUpperCase()} - ${
        errorDetails.category
      }: ${error.message}`;
      setErrorLog(prev => [logEntry, ...prev].slice(0, 10));
    },
    []
  );

  const resetDemo = (): void => {
    setResetKey(prev => prev + 1);
    setErrorLog([]);
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <ShowcaseHero
        title='SPFx Error Boundary'
        subtitle='Production-ready error handling with smart recovery and comprehensive logging.'
        gradient='linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'
        badges={ERROR_BOUNDARY_BADGES}
        icon='🛡️'
      />

      {/* Quick Controls */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '10px 20px',
            background: showDebug ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {showDebug ? 'Hide' : 'Show'} Debug Console
        </button>
        <button
          onClick={resetDemo}
          style={{
            padding: '10px 20px',
            background: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          Reset All Demos
        </button>
      </div>

      {/* Debug Console */}
      {showDebug && (
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #ffc83d',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#323130' }}>
            Debug Console
          </h3>
          <div
            style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '13px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {errorLog.length === 0 ? (
              <div style={{ color: '#808080' }}>Waiting for errors...</div>
            ) : (
              errorLog.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setErrorLog([])}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Clear Logs
          </button>
        </div>
      )}

      {/* Interactive Demo Section */}
      <div
        style={{
          background: 'white',
          padding: '32px',
          borderRadius: '12px',
          marginBottom: '32px',
          border: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#323130' }}>
          Interactive Demo: Try Different Error Types
        </h2>
        <p style={{ margin: '0 0 24px 0', color: '#605e5c', fontSize: '16px' }}>
          Click any button to trigger an error and see how the Error Boundary handles it with smart
          classification and recovery options.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
            alignItems: 'stretch',
            gridAutoRows: '1fr',
          }}
        >
          <div style={{ minHeight: '320px' }}>
            <ErrorBoundary
              key={`render-${resetKey}`}
              {...ERROR_BOUNDARY_CONFIGS.STANDARD}
              onError={handleGlobalError}
              resetOnPropsChange={false}
            >
              <div style={{ height: '100%' }}>
                <ErrorTrigger
                  errorType='render'
                  title='Component Error'
                  description='Simulates a component that fails during rendering. Not retriable.'
                  buttonText='Trigger Render Error'
                  icon='⚠️'
                />
              </div>
            </ErrorBoundary>
          </div>

          <div style={{ minHeight: '320px' }}>
            <ErrorBoundary
              key={`network-${resetKey}`}
              {...ERROR_BOUNDARY_CONFIGS.ENHANCED}
              onError={handleGlobalError}
              resetOnPropsChange={false}
            >
              <div style={{ height: '100%' }}>
                <ErrorTrigger
                  errorType='network'
                  title='Network Error'
                  description='Simulates a failed API call. Automatically retriable with backoff.'
                  buttonText='Trigger Network Error'
                  icon='🌐'
                />
              </div>
            </ErrorBoundary>
          </div>

          <div style={{ minHeight: '320px' }}>
            <ErrorBoundary
              key={`permission-${resetKey}`}
              {...ERROR_BOUNDARY_CONFIGS.MINIMAL}
              onError={handleGlobalError}
              resetOnPropsChange={false}
            >
              <div style={{ height: '100%' }}>
                <ErrorTrigger
                  errorType='permission'
                  title='Permission Error'
                  description='Simulates access denied. Minimal config with no retry.'
                  buttonText='Trigger Permission Error'
                  icon='🔒'
                />
              </div>
            </ErrorBoundary>
          </div>

          <div style={{ minHeight: '320px' }}>
            <ErrorBoundary
              key={`hook-${resetKey}`}
              {...ERROR_BOUNDARY_CONFIGS.STANDARD}
              onError={handleGlobalError}
              resetOnPropsChange={false}
            >
              <div style={{ height: '100%' }}>
                <HookBasedDemo />
              </div>
            </ErrorBoundary>
          </div>
        </div>

        <div
          style={{
            background: '#e7f3ff',
            border: '1px solid #84c5ff',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#0056b3', fontSize: '16px' }}>What to Try:</h4>
          <ul style={{ margin: 0, paddingLeft: '24px', color: '#004085', lineHeight: '1.8' }}>
            <li>
              <strong>Click any error button</strong> to see the error boundary in action
            </li>
            <li>
              <strong>Watch the severity badges</strong> (critical/high/medium/low) and categories
            </li>
            <li>
              <strong>Try the retry button</strong> on retriable errors (network, async)
            </li>
            <li>
              <strong>Click &quot;Show Details&quot;</strong> to see full error information and stack traces
            </li>
            <li>
              <strong>Enable debug console</strong> to see error classification in real-time
            </li>
          </ul>
        </div>
      </div>

      <ShowcaseKeyFeatures features={ERROR_BOUNDARY_FEATURES} />

      <ShowcaseCodeSample
        id='error-boundary-sample'
        title='Error Boundary Integration'
        description='Wrap risky components with the toolkit ErrorBoundary and surface async failures via useErrorHandler.'
        code={ERROR_BOUNDARY_SAMPLE}
        language='tsx'
      />
    </div>
  );
};

export default ErrorBoundaryShowcase;
