import * as React from 'react';
import { IconButton, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import styles from './CodeEditor.module.scss';

/**
 * CodeEditor - Professional code editor component with custom syntax highlighting
 *
 * Features:
 * - Auto-height: Automatically adjusts height based on content (default: true)
 *   - Small snippets (3-5 lines): ~100-150px
 *   - Medium code (20 lines): ~400px
 *   - Large code (50+ lines): Up to maxHeight (default 600px), then scrolls
 * - Compact mode: Lightweight pre/code for simple commands
 * - Syntax highlighting for common languages
 * - Copy to clipboard and download functionality
 * - Read-only and editable modes
 *
 * @example
 * // Compact mode for PowerShell/bash commands
 * <CodeEditor value={code} language="powershell" />
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
  /** Use compact mode (lightweight pre/code) - ideal for simple commands */
  compact?: boolean;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to show minimap (kept for API compatibility, ignored in custom editor) */
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

// Language-specific keywords for syntax highlighting
const KEYWORDS: { [key: string]: string[] } = {
  typescript: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum', 'namespace', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly', 'abstract', 'default', 'void', 'never', 'any', 'string', 'number', 'boolean', 'object', 'symbol', 'bigint', 'unknown', 'as', 'is', 'in', 'of', 'typeof', 'instanceof', 'keyof', 'declare', 'module', 'require', 'get', 'set'],
  tsx: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum', 'namespace', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly', 'abstract', 'default', 'void', 'never', 'any', 'string', 'number', 'boolean', 'object', 'symbol', 'bigint', 'unknown', 'as', 'is', 'in', 'of', 'typeof', 'instanceof', 'keyof', 'declare', 'module', 'require', 'get', 'set'],
  javascript: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'default', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'yield', 'with', 'debugger'],
  jsx: ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'class', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'default', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'yield', 'with', 'debugger'],
  json: [],
  css: ['@import', '@media', '@keyframes', '@font-face', '@supports', '@namespace', '@page', '@charset', '!important'],
  scss: ['@import', '@media', '@keyframes', '@font-face', '@supports', '@namespace', '@page', '@charset', '!important', '@mixin', '@include', '@extend', '@if', '@else', '@for', '@each', '@while', '@function', '@return', '@at-root', '@debug', '@warn', '@error'],
  html: [],
  xml: [],
  powershell: ['$', 'function', 'param', 'begin', 'process', 'end', 'if', 'else', 'elseif', 'switch', 'default', 'for', 'foreach', 'while', 'do', 'until', 'break', 'continue', 'return', 'exit', 'throw', 'try', 'catch', 'finally', 'trap', 'filter', 'class', 'enum', 'using', 'workflow', 'parallel', 'sequence', 'inlinescript'],
  bash: ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done', 'in', 'function', 'return', 'exit', 'break', 'continue', 'export', 'local', 'readonly', 'declare', 'typeset', 'unset', 'shift', 'source', 'alias', 'unalias', 'set', 'eval', 'exec', 'trap'],
  shell: ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done', 'in', 'function', 'return', 'exit', 'break', 'continue', 'export', 'local', 'readonly', 'declare', 'typeset', 'unset', 'shift', 'source', 'alias', 'unalias', 'set', 'eval', 'exec', 'trap'],
  markdown: [],
  yaml: [],
  sql: ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ON', 'AS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA', 'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'BEGIN', 'END', 'DECLARE', 'CURSOR', 'FETCH', 'CLOSE', 'GROUP', 'HAVING', 'UNION', 'EXCEPT', 'INTERSECT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'EXISTS', 'ALL', 'ANY', 'SOME', 'DISTINCT', 'TOP', 'PERCENT', 'WITH', 'AS', 'RECURSIVE', 'PARTITION', 'OVER', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE'],
  csharp: ['using', 'namespace', 'class', 'interface', 'struct', 'enum', 'delegate', 'event', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'volatile', 'virtual', 'override', 'abstract', 'sealed', 'partial', 'async', 'await', 'new', 'this', 'base', 'return', 'if', 'else', 'switch', 'case', 'default', 'for', 'foreach', 'while', 'do', 'break', 'continue', 'goto', 'try', 'catch', 'finally', 'throw', 'lock', 'using', 'checked', 'unchecked', 'fixed', 'unsafe', 'stackalloc', 'typeof', 'sizeof', 'nameof', 'is', 'as', 'in', 'out', 'ref', 'params', 'var', 'dynamic', 'void', 'bool', 'byte', 'sbyte', 'char', 'short', 'ushort', 'int', 'uint', 'long', 'ulong', 'float', 'double', 'decimal', 'string', 'object', 'true', 'false', 'null', 'where', 'select', 'from', 'orderby', 'ascending', 'descending', 'group', 'by', 'into', 'join', 'on', 'equals', 'let', 'get', 'set', 'add', 'remove', 'value', 'yield', 'global', 'alias', 'extern'],
  python: ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'True', 'False', 'None', 'self', 'cls'],
};

/**
 * Token type for syntax highlighting
 */
interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'boolean' | 'tag' | 'attribute' | 'text';
  value: string;
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
 * Tokenize a single line of code for basic syntax highlighting
 */
function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];
  const keywords = KEYWORDS[language] || KEYWORDS['typescript'] || [];

  // Special handling for XML/HTML
  if (language === 'xml' || language === 'html') {
    return tokenizeXmlLine(line);
  }

  // Handle comments
  const commentIndex = line.indexOf('//');
  if (commentIndex !== -1 && !isInString(line, commentIndex)) {
    const beforeComment = line.substring(0, commentIndex);
    const comment = line.substring(commentIndex);

    if (beforeComment) {
      tokens.push(...tokenizeText(beforeComment, keywords, language));
    }
    tokens.push({ type: 'comment', value: comment });
    return tokens;
  }

  // Handle # comments (bash/powershell/python)
  if (['bash', 'shell', 'powershell', 'python', 'yaml'].includes(language)) {
    const hashIndex = line.indexOf('#');
    if (hashIndex !== -1 && !isInString(line, hashIndex)) {
      const beforeComment = line.substring(0, hashIndex);
      const comment = line.substring(hashIndex);

      if (beforeComment) {
        tokens.push(...tokenizeText(beforeComment, keywords, language));
      }
      tokens.push({ type: 'comment', value: comment });
      return tokens;
    }
  }

  return tokenizeText(line, keywords, language);
}

/**
 * Tokenize XML/HTML line
 */
function tokenizeXmlLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  // Match XML comments
  const commentMatch = remaining.match(/<!--[\s\S]*?-->/);
  if (commentMatch && remaining.indexOf(commentMatch[0]) === 0) {
    tokens.push({ type: 'comment', value: commentMatch[0] });
    remaining = remaining.substring(commentMatch[0].length);
  }

  while (remaining.length > 0) {
    // Match tags
    const tagMatch = remaining.match(/^(<\/?[\w:-]+)/);
    if (tagMatch) {
      tokens.push({ type: 'tag', value: tagMatch[1] });
      remaining = remaining.substring(tagMatch[1].length);
      continue;
    }

    // Match closing >
    if (remaining[0] === '>' || remaining.startsWith('/>')) {
      const closeTag = remaining.startsWith('/>') ? '/>' : '>';
      tokens.push({ type: 'tag', value: closeTag });
      remaining = remaining.substring(closeTag.length);
      continue;
    }

    // Match attributes
    const attrMatch = remaining.match(/^\s+([\w:-]+)=/);
    if (attrMatch) {
      tokens.push({ type: 'text', value: attrMatch[0].substring(0, attrMatch[0].indexOf(attrMatch[1])) });
      tokens.push({ type: 'attribute', value: attrMatch[1] + '=' });
      remaining = remaining.substring(attrMatch[0].length);
      continue;
    }

    // Match string values
    const stringMatch = remaining.match(/^("[^"]*"|'[^']*')/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[1] });
      remaining = remaining.substring(stringMatch[1].length);
      continue;
    }

    // Match any other character
    tokens.push({ type: 'text', value: remaining[0] });
    remaining = remaining.substring(1);
  }

  return tokens;
}

/**
 * Tokenize text with keyword and string highlighting
 */
function tokenizeText(text: string, keywords: string[], language: string): Token[] {
  const tokens: Token[] = [];
  let currentToken = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : '';

    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        if (currentToken) {
          tokens.push(...finalizeToken(currentToken, keywords, language));
          currentToken = '';
        }
        inString = true;
        stringChar = char;
        currentToken = char;
      } else if (char === stringChar) {
        currentToken += char;
        tokens.push({ type: 'string', value: currentToken });
        currentToken = '';
        inString = false;
        stringChar = '';
      } else {
        currentToken += char;
      }
    } else if (inString) {
      currentToken += char;
    } else {
      // Not in string - check for word boundaries
      if (/\s/.test(char) || /[{}()[\];:,.<>!&|+\-*/=@$%^~?]/.test(char)) {
        if (currentToken) {
          tokens.push(...finalizeToken(currentToken, keywords, language));
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
      tokens.push(...finalizeToken(currentToken, keywords, language));
    }
  }

  return tokens;
}

/**
 * Finalize a token by determining its type
 */
function finalizeToken(token: string, keywords: string[], language: string): Token[] {
  // Check if it's a keyword (case-insensitive for SQL)
  const isKeyword = language === 'sql'
    ? keywords.some(k => k.toLowerCase() === token.toLowerCase())
    : keywords.includes(token);

  if (isKeyword) {
    return [{ type: 'keyword', value: token }];
  }

  // Check if it's a number
  if (/^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(token) || /^0x[0-9a-fA-F]+$/.test(token)) {
    return [{ type: 'number', value: token }];
  }

  // Check if it's a boolean or null
  if (['true', 'false', 'null', 'undefined', 'True', 'False', 'None', 'nil'].includes(token)) {
    return [{ type: 'boolean', value: token }];
  }

  return [{ type: 'text', value: token }];
}

export const CodeEditor: React.FC<ICodeEditorProps> = ({
  value,
  language,
  compact = false,
  readOnly = true,
  showLineNumbers = true,
  // showMiniMap is kept for API compatibility but ignored
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
  const [internalValue, setInternalValue] = React.useState(value);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const copyTimeoutRef = React.useRef<number | null>(null);

  // Sync internal value with prop
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Calculate editor height based on content
  const calculatedHeight = React.useMemo(() => {
    const displayValue = readOnly ? value : internalValue;
    if (!autoHeight) {
      return {
        minHeight: minHeight ?? 400,
        maxHeight: maxHeight,
      };
    }

    const lineCount = displayValue ? displayValue.split('\n').length : 1;
    const LINE_HEIGHT = 21; // Custom editor line height
    const PADDING = 24; // Padding for editor
    const calculatedSize = lineCount * LINE_HEIGHT + PADDING;

    const min = minHeight ?? 100;
    const max = maxHeight ?? 600;

    const constrainedHeight = Math.max(min, Math.min(max, calculatedSize));

    return {
      minHeight: constrainedHeight,
      maxHeight: max,
    };
  }, [value, internalValue, readOnly, autoHeight, minHeight, maxHeight]);

  const handleCopy = React.useCallback(() => {
    const textToCopy = readOnly ? value : internalValue;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopySuccess(true);
        if (copyTimeoutRef.current) {
          window.clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = window.setTimeout(() => {
          setCopySuccess(false);
          copyTimeoutRef.current = null;
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy code:', err);
      }
    );
  }, [value, internalValue, readOnly]);

  const handleDownload = React.useCallback(() => {
    const textToDownload = readOnly ? value : internalValue;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [value, internalValue, readOnly, fileName]);

  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue, []);
    }
  }, [onChange]);

  // Highlight code with syntax coloring
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
              <span key={tokenIndex} className={styles[token.type] || styles.text}>
                {token.value}
              </span>
            ))}
            {line === '' && '\n'}
          </span>
        </div>
      );
    });
  }, [showLineNumbers]);

  const displayValue = readOnly ? value : internalValue;
  const highlightedCode = React.useMemo(
    () => highlightCode(displayValue || '', language),
    [displayValue, language, highlightCode]
  );

  const isDark = theme === 'vs-dark';
  const containerClass = isDark ? styles.codeEditorDark : styles.codeEditorLight;

  // Compact mode - lightweight pre/code rendering
  if (compact) {
    return (
      <div className={styles.compactCodeContainer}>
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
        <pre className={isDark ? styles.compactCodeDark : styles.compactCodeLight}>
          <code>{displayValue}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={containerClass}>
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

      {/* Copy Success Message */}
      {copySuccess && (
        <MessageBar messageBarType={MessageBarType.success} isMultiline={false}>
          Code copied to clipboard!
        </MessageBar>
      )}

      {/* Code Content */}
      <div
        className={styles.codeContent}
        style={{
          height: autoHeight ? `${calculatedHeight.minHeight}px` : undefined,
          minHeight: !autoHeight ? `${calculatedHeight.minHeight}px` : undefined,
          maxHeight: calculatedHeight.maxHeight ? `${calculatedHeight.maxHeight}px` : undefined,
        }}
      >
        {!readOnly && (
          <textarea
            ref={textareaRef}
            className={styles.codeTextarea}
            value={internalValue}
            onChange={handleTextChange}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
        )}
        <pre className={styles.codeBlock}>
          {highlightedCode}
        </pre>
      </div>
    </div>
  );
};
