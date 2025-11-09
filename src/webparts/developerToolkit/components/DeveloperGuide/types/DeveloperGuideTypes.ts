/**
 * Type definitions for Developer Guide
 */

/**
 * Available tab keys in Developer Guide
 */
export type DeveloperGuideTab =
  | 'quick-start'
  | 'vscode-setup'
  | 'fast-serve'
  | 'folder-structure'
  | 'toolkit-integration'
  | 'azure-devops'
  | 'copilot-instructions'
  | 'project-setup'
  | 'useful-links'
  | 'code-quality'
  | 'debugging'
  | 'performance'
  | 'testing'
  | 'security'
  | 'collaboration';

/**
 * Tab configuration
 */
export interface IDeveloperGuideTabConfig {
  key: DeveloperGuideTab;
  title: string;
  icon: string;
  description: string;
  badge?: string | number;
}

/**
 * Code snippet configuration
 */
export interface ICodeSnippet {
  code: string;
  language: 'typescript' | 'javascript' | 'json' | 'bash' | 'yaml' | 'xml' | 'html' | 'css' | 'markdown';
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
}

/**
 * Command configuration
 */
export interface ICommand {
  command: string;
  description: string;
  category?: string;
}

/**
 * Git command configuration
 */
export interface IGitCommand extends ICommand {
  example?: string;
  dangerous?: boolean;
}

/**
 * Folder tree node
 */
export interface IFolderNode {
  name: string;
  type: 'folder' | 'file';
  path?: string;
  icon?: string;
  description?: string;
  children?: IFolderNode[];
  expanded?: boolean;
}

/**
 * Checklist item
 */
export interface IChecklistItem {
  id: string;
  label: string;
  completed?: boolean;
  timeEstimate?: string; // e.g., "5 min"
}

/**
 * Section configuration
 */
export interface ISection {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  expanded?: boolean;
  content: React.ReactNode;
}

/**
 * Props for Developer Guide component
 */
export interface IDeveloperGuideProps {
  initialTab?: DeveloperGuideTab;
}

/**
 * Props for tab components
 */
export interface ITabComponentProps {
  onNavigate?: (tab: DeveloperGuideTab) => void;
}

/**
 * Props for CodeBlock component
 */
export interface ICodeBlockProps {
  code: string;
  language: ICodeSnippet['language'];
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  showCopyButton?: boolean;
  maxHeight?: number;
  compact?: boolean;
}

/**
 * Props for CommandPalette component
 */
export interface ICommandPaletteProps {
  commands: ICommand[];
  title?: string;
  searchable?: boolean;
  grouped?: boolean;
}

/**
 * Props for FolderTree component
 */
export interface IFolderTreeProps {
  tree: IFolderNode;
  onNodeClick?: (node: IFolderNode) => void;
  expandAll?: boolean;
}

/**
 * Props for Checklist component
 */
export interface IChecklistProps {
  items: IChecklistItem[];
  onItemToggle?: (itemId: string, completed: boolean) => void;
  showProgress?: boolean;
}

/**
 * Search result
 */
export interface ISearchResult {
  tab: DeveloperGuideTab;
  title: string;
  snippet: string;
  matchedText: string;
}
