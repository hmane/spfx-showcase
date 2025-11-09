import * as React from 'react';
import { MonacoEditor } from '@pnp/spfx-controls-react/lib/MonacoEditor';
import { IconButton, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import styles from './CodeEditor.module.scss';

/**
 * CodeEditor - Professional code editor component using Monaco Editor (VS Code's editor)
 *
 * Features:
 * - Auto-height: Automatically adjusts height based on content (default: true)
 *   - Small snippets (3-5 lines): ~100-150px
 *   - Medium code (20 lines): ~400px
 *   - Large code (50+ lines): Up to maxHeight (default 600px), then scrolls
 * - Compact mode: Lightweight pre/code for simple commands (no Monaco overhead)
 * - Syntax highlighting for 50+ languages (full mode only)
 * - Copy to clipboard and download functionality
 * - Read-only and editable modes
 * - Validation and error display
 *
 * @example
 * // Compact mode for PowerShell/bash commands
 * <CodeEditor value={code} language="powershell" compact={true} />
 *
 * // Auto-height for code snippets
 * <CodeEditor value={code} language="typescript" autoHeight={true} />
 *
 * // Fixed height for editable code
 * <CodeEditor value={code} language="typescript" autoHeight={false} minHeight={400} readOnly={false} />
 */
export interface ICodeEditorProps {
  /** The code content to display */
  value: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Use compact mode (lightweight pre/code, no Monaco) - ideal for simple commands */
  compact?: boolean;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to show minimap */
  showMiniMap?: boolean;
  /** Editor theme: 'vs' (light) or 'vs-dark' (dark) */
  theme?: 'vs' | 'vs-dark';
  /** Callback when code changes (only for editable mode) */
  onChange?: (newValue: string, validationErrors: string[]) => void;
  /** Whether to show copy button */
  showCopyButton?: boolean;
  /** Whether to show download button */
  showDownloadButton?: boolean;
  /** Optional filename to display in header */
  fileName?: string;
  /** Optional language badge to display */
  languageBadge?: string;
  /** Automatically calculate height based on content (default: true) */
  autoHeight?: boolean;
  /** Minimum height of editor (default: 100px for auto, 400px for fixed) */
  minHeight?: number;
  /** Maximum height of editor (default: 600px for auto, undefined for fixed) */
  maxHeight?: number;
}

export const CodeEditor: React.FC<ICodeEditorProps> = ({
  value,
  language,
  compact = false,
  readOnly = true,
  showLineNumbers = true,
  showMiniMap = false,
  theme = 'vs-dark',
  onChange,
  showCopyButton = true,
  showDownloadButton = false,
  fileName,
  languageBadge,
  autoHeight = true,
  minHeight,
  maxHeight,
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  // Calculate editor height based on content
  const calculatedHeight = React.useMemo(() => {
    if (!autoHeight) {
      // Fixed height mode
      return {
        minHeight: minHeight ?? 400,
        maxHeight: maxHeight,
      };
    }

    // Auto height mode - calculate based on line count
    const lineCount = value ? value.split('\n').length : 1;
    const LINE_HEIGHT = 19; // Monaco editor default line height
    const PADDING = 40; // Padding for editor chrome
    const calculatedSize = lineCount * LINE_HEIGHT + PADDING;

    const min = minHeight ?? 100;
    const max = maxHeight ?? 600;

    // Apply constraints
    const constrainedHeight = Math.max(min, Math.min(max, calculatedSize));

    return {
      minHeight: constrainedHeight,
      maxHeight: max,
    };
  }, [value, autoHeight, minHeight, maxHeight]);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (err) => {
        console.error('Failed to copy code:', err);
      }
    );
  }, [value]);

  const handleDownload = React.useCallback(() => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [value, fileName]);

  const handleValueChange = React.useCallback(
    (newValue: string, errors: string[]) => {
      setValidationErrors(errors || []);
      if (onChange) {
        onChange(newValue, errors || []);
      }
    },
    [onChange]
  );

  // Compact mode - lightweight pre/code rendering
  if (compact) {
    return (
      <div className={styles.compactCodeContainer}>
        {/* Header for compact mode */}
        {(fileName || languageBadge || showCopyButton) && (
          <div className={styles.compactHeader}>
            <div className={styles.headerLeft}>
              {fileName && <span className={styles.fileName}>{fileName}</span>}
              {languageBadge && <span className={styles.languageBadge}>{languageBadge}</span>}
            </div>
            {showCopyButton && (
              <IconButton
                iconProps={{ iconName: copySuccess ? 'CheckMark' : 'Copy' }}
                title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                ariaLabel="Copy code to clipboard"
                onClick={handleCopy}
                className={styles.actionButton}
                styles={{ root: { height: '24px', width: '24px' } }}
              />
            )}
          </div>
        )}
        {/* Simple pre/code for compact mode */}
        <pre className={theme === 'vs-dark' ? styles.compactCodeDark : styles.compactCodeLight}>
          <code>{value}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={styles.codeEditorContainer}>
      {/* Header */}
      {(fileName || languageBadge || showCopyButton || showDownloadButton) && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {fileName && <span className={styles.fileName}>{fileName}</span>}
            {languageBadge && <span className={styles.languageBadge}>{languageBadge}</span>}
          </div>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            {showCopyButton && (
              <IconButton
                iconProps={{ iconName: copySuccess ? 'CheckMark' : 'Copy' }}
                title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                ariaLabel="Copy code to clipboard"
                onClick={handleCopy}
                className={styles.actionButton}
              />
            )}
            {showDownloadButton && (
              <IconButton
                iconProps={{ iconName: 'Download' }}
                title="Download file"
                ariaLabel="Download code as file"
                onClick={handleDownload}
                className={styles.actionButton}
              />
            )}
          </Stack>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          {validationErrors.length === 1
            ? validationErrors[0]
            : `${validationErrors.length} validation errors found`}
        </MessageBar>
      )}

      {/* Copy Success Message */}
      {copySuccess && (
        <MessageBar messageBarType={MessageBarType.success} isMultiline={false}>
          Code copied to clipboard!
        </MessageBar>
      )}

      {/* Monaco Editor */}
      <div
        className={styles.editorWrapper}
        style={{
          height: autoHeight ? `${calculatedHeight.minHeight}px` : undefined,
          minHeight: !autoHeight ? `${calculatedHeight.minHeight}px` : undefined,
          maxHeight: calculatedHeight.maxHeight ? `${calculatedHeight.maxHeight}px` : undefined,
        }}
      >
        <MonacoEditor
          value={value}
          language={language}
          theme={theme}
          readOnly={readOnly}
          showLineNumbers={showLineNumbers}
          showMiniMap={showMiniMap}
          onValueChange={handleValueChange}
        />
      </div>
    </div>
  );
};
