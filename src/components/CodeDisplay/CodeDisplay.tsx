import * as React from 'react';
import { IconButton } from '@fluentui/react';
import styles from './CodeDisplay.module.scss';

/**
 * Custom lightweight code display component with basic syntax highlighting.
 * Replaces Monaco Editor to avoid TypeScript errors and reduce bundle size.
 *
 * Features:
 * - Basic syntax highlighting (keywords, strings, comments, numbers)
 * - Line numbers
 * - Copy to clipboard
 * - File name/path display
 * - Language badge
 * - Collapsible for long code
 * - Light and dark themes
 *
 * @example
 * ```tsx
 * <CodeDisplay
 *   code={sampleCode}
 *   language="typescript"
 *   fileName="example.ts"
 *   title="Usage Example"
 * />
 * ```
 */
export interface ICodeDisplayProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: 'typescript' | 'tsx' | 'javascript' | 'jsx' | 'json' | 'css' | 'scss' | 'html' | 'xml' | 'powershell' | 'bash' | 'markdown';
  /** Optional file name or path to display in header */
  fileName?: string;
  /** Optional title for the code section */
  title?: string;
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Whether to show copy button (default: true) */
  showCopyButton?: boolean;
  /** Whether the code section is collapsible for long code (default: false) */
  collapsible?: boolean;
  /** Theme: 'light' or 'dark' (default: 'dark') */
  theme?: 'light' | 'dark';
  /** Maximum height before scrolling (default: 600px) */
  maxHeight?: number;
  /** Optional description text */
  description?: string;
}

/**
 * CodeDisplay component - Custom syntax highlighting without external packages
 */
export const CodeDisplay: React.FC<ICodeDisplayProps> = ({
  code,
  language = 'typescript',
  fileName,
  title,
  showLineNumbers = true,
  showCopyButton = true,
  collapsible = false,
  theme = 'dark',
  maxHeight = 600,
  description,
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(collapsible);
  const copyTimeoutRef = React.useRef<number | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle copy to clipboard
   */
  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopySuccess(true);
        // Clear any existing timeout
        if (copyTimeoutRef.current) {
          window.clearTimeout(copyTimeoutRef.current);
        }
        // Set new timeout
        copyTimeoutRef.current = window.setTimeout(() => {
          setCopySuccess(false);
          copyTimeoutRef.current = null;
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy code:', err);
      }
    );
  }, [code]);

  /**
   * Toggle collapsed state
   */
  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * Highlight code with basic syntax coloring
   */
  const highlightCode = React.useCallback((codeStr: string, lang: string): JSX.Element[] => {
    const lines = codeStr.split('\n');

    return lines.map((line, index) => {
      const tokens = tokenizeLine(line, lang);
      return (
        <div key={index} className={styles.codeLine}>
          {showLineNumbers && (
            <span className={styles.lineNumber}>{index + 1}</span>
          )}
          <span className={styles.lineContent}>
            {tokens.map((token, tokenIndex) => (
              <span key={tokenIndex} className={(styles as any)[token.type] || styles.text}>
                {token.value}
              </span>
            ))}
          </span>
        </div>
      );
    });
  }, [showLineNumbers]);

  const highlightedCode = React.useMemo(() => highlightCode(code, language), [code, language, highlightCode]);

  const containerClass = theme === 'dark' ? styles.codeDisplayDark : styles.codeDisplayLight;
  const languageBadge = language.toUpperCase();

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {title && <span className={styles.title}>{title}</span>}
          {fileName && <span className={styles.fileName}>{fileName}</span>}
          <span className={styles.languageBadge}>{languageBadge}</span>
        </div>
        <div className={styles.headerRight}>
          {collapsible && (
            <IconButton
              iconProps={{ iconName: isCollapsed ? 'ChevronDown' : 'ChevronUp' }}
              title={isCollapsed ? 'Expand' : 'Collapse'}
              ariaLabel={isCollapsed ? 'Expand code' : 'Collapse code'}
              onClick={toggleCollapse}
              className={styles.actionButton}
            />
          )}
          {showCopyButton && (
            <IconButton
              iconProps={{ iconName: copySuccess ? 'CheckMark' : 'Copy' }}
              title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
              ariaLabel="Copy code to clipboard"
              onClick={handleCopy}
              className={styles.actionButton}
            />
          )}
        </div>
      </div>

      {/* Description */}
      {description && !isCollapsed && (
        <div className={styles.description}>{description}</div>
      )}

      {/* Code Content */}
      {!isCollapsed && (
        <div
          className={styles.codeContent}
          style={{ maxHeight: `${maxHeight}px` }}
        >
          <pre className={styles.codeBlock}>
            {highlightedCode}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Token type for syntax highlighting
 */
interface Token {
  type: string;
  value: string;
}

/**
 * Tokenize a single line of code for basic syntax highlighting
 */
function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];

  // Language-specific keywords
  const keywords: { [key: string]: string[] } = {
    typescript: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum', 'namespace', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly', 'abstract'],
    tsx: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum', 'namespace', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly', 'abstract'],
    javascript: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends'],
    jsx: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends'],
  };

  const langKeywords = keywords[language] || keywords['typescript'];

  // Handle comments
  const commentIndex = line.indexOf('//');
  if (commentIndex !== -1 && !isInString(line, commentIndex)) {
    const beforeComment = line.substring(0, commentIndex);
    const comment = line.substring(commentIndex);

    if (beforeComment) {
      tokens.push(...tokenizeText(beforeComment, langKeywords));
    }
    tokens.push({ type: 'comment', value: comment });
    return tokens;
  }

  // Tokenize the line
  return tokenizeText(line, langKeywords);
}

/**
 * Check if a position in string is inside a string literal
 */
function isInString(line: string, position: number): boolean {
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < position; i++) {
    const char = line[i];
    if ((char === '"' || char === "'" || char === '`') && (i === 0 || line[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
  }

  return inString;
}

/**
 * Tokenize text with keyword and string highlighting
 */
function tokenizeText(text: string, keywords: string[]): Token[] {
  const tokens: Token[] = [];
  let currentToken = '';
  let currentType = 'text';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : '';

    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        // Start of string
        if (currentToken) {
          tokens.push(...finalizeToken(currentToken, currentType, keywords));
          currentToken = '';
        }
        inString = true;
        stringChar = char;
        currentType = 'string';
        currentToken = char;
      } else if (char === stringChar) {
        // End of string
        currentToken += char;
        tokens.push({ type: 'string', value: currentToken });
        currentToken = '';
        currentType = 'text';
        inString = false;
        stringChar = '';
      } else {
        currentToken += char;
      }
    } else if (inString) {
      currentToken += char;
    } else {
      // Not in string - check for word boundaries
      if (/\s/.test(char) || /[{}()[\];:,.<>!&|+\-*/=]/.test(char)) {
        if (currentToken) {
          tokens.push(...finalizeToken(currentToken, currentType, keywords));
          currentToken = '';
        }
        tokens.push({ type: 'text', value: char });
      } else {
        currentToken += char;
      }
    }
  }

  // Finalize remaining token
  if (currentToken) {
    if (inString) {
      tokens.push({ type: 'string', value: currentToken });
    } else {
      tokens.push(...finalizeToken(currentToken, currentType, keywords));
    }
  }

  return tokens;
}

/**
 * Finalize a token by determining its type
 */
function finalizeToken(token: string, type: string, keywords: string[]): Token[] {
  // Check if it's a keyword
  if (keywords.includes(token)) {
    return [{ type: 'keyword', value: token }];
  }

  // Check if it's a number
  if (/^\d+(\.\d+)?$/.test(token)) {
    return [{ type: 'number', value: token }];
  }

  // Check if it's a boolean or null
  if (['true', 'false', 'null', 'undefined'].includes(token)) {
    return [{ type: 'boolean', value: token }];
  }

  return [{ type: 'text', value: token }];
}

export default CodeDisplay;
