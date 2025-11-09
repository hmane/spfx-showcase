import * as React from 'react';
import { ICodeBlockProps } from '../../types/DeveloperGuideTypes';
import { CodeEditor } from '../../../../../../components/CodeEditor';

/**
 * Code block component with syntax highlighting and copy functionality.
 * Now uses MonacoEditor for professional VS Code-like syntax highlighting.
 * Supports compact mode for simple commands and config files.
 */
export const CodeBlock: React.FC<ICodeBlockProps> = ({
  code,
  language,
  filename,
  showLineNumbers = true,
  highlightLines = [], // Note: Line highlighting not yet implemented in MonacoEditor wrapper
  showCopyButton = true,
  maxHeight,
  compact = false,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <CodeEditor
        value={code}
        language={language}
        compact={compact}
        readOnly={true}
        showLineNumbers={showLineNumbers}
        showMiniMap={false}
        theme="vs-dark"
        showCopyButton={showCopyButton}
        showDownloadButton={false}
        fileName={filename}
        autoHeight={true}
        maxHeight={maxHeight}
      />
    </div>
  );
};
