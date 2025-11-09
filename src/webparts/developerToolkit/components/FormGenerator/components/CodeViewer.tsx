import * as React from 'react';
import { CodeEditor } from '../../../../../components/CodeEditor';

export interface ICodeViewerProps {
  code: string;
  language?: string;
  fileName?: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

/**
 * Code viewer component with MonacoEditor for professional syntax highlighting.
 * Now supports editing so users can experiment with generated code!
 */
export const CodeViewer: React.FC<ICodeViewerProps> = ({
  code,
  language = 'typescript',
  fileName = 'code.tsx',
  onCopy,
  onDownload,
}) => {
  const [currentCode, setCurrentCode] = React.useState(code);

  // Update currentCode when code prop changes
  React.useEffect(() => {
    setCurrentCode(code);
  }, [code]);

  const handleCodeChange = (newCode: string, validationErrors: string[]) => {
    setCurrentCode(newCode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <CodeEditor
        value={currentCode || '// No code generated yet'}
        language={language}
        readOnly={false} // Allow editing!
        showLineNumbers={true}
        showMiniMap={true}
        theme="vs-dark"
        showCopyButton={true}
        showDownloadButton={true}
        fileName={fileName}
        autoHeight={false} // Fixed height for editable mode - more stable for editing
        minHeight={400}
        onChange={handleCodeChange}
      />
    </div>
  );
};
