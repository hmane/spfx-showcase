import * as React from 'react';
import { CodeDisplay } from '../../../../components/CodeDisplay';

/**
 * Props for ShowcaseCodeSample component
 */
interface ShowcaseCodeSampleProps {
  /** Unique identifier for the section */
  id: string;
  /** Title displayed above the code */
  title: string;
  /** Code content to display */
  code: string;
  /** Optional description text */
  description?: string;
  /** Programming language for syntax highlighting */
  language?: 'typescript' | 'tsx' | 'javascript' | 'jsx' | 'json' | 'css' | 'scss' | 'html' | 'xml' | 'powershell' | 'bash' | 'markdown';
  /** Optional file name or path to display */
  fileName?: string;
}

/**
 * Shared code sample presenter - displays code with heading (no Card wrapper)
 * Uses custom CodeDisplay component with basic syntax highlighting (no Monaco, no external packages).
 *
 * @example
 * ```tsx
 * <ShowcaseCodeSample
 *   id="usage-example"
 *   title="Basic Usage"
 *   code={sampleCode}
 *   language="tsx"
 *   description="Simple example showing basic component usage"
 * />
 * ```
 */
export const ShowcaseCodeSample: React.FC<ShowcaseCodeSampleProps> = ({
  id,
  title,
  code,
  description,
  language = 'tsx',
  fileName,
}) => {
  return (
    <div id={id} style={{ marginTop: '32px' }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '20px',
        fontWeight: 600,
        color: '#323130',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        {title}
      </h3>
      <CodeDisplay
        code={code}
        language={language}
        fileName={fileName}
        description={description}
        showLineNumbers={true}
        showCopyButton={true}
        collapsible={false}
        theme="dark"
        maxHeight={600}
      />
    </div>
  );
};

export default ShowcaseCodeSample;
