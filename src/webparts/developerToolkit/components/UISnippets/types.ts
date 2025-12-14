// UI Snippets Types

/**
 * Snippet category
 */
export type SnippetCategory =
  | 'feedback'
  | 'layout'
  | 'flex'
  | 'patterns'
  | 'interactive'
  | 'navigation'
  | 'data'
  | 'forms'
  | 'sharepoint';

/**
 * UI Snippet definition
 */
export interface ISnippet {
  id: string;
  title: string;
  description: string;
  category: SnippetCategory;
  /** JSX code string that developers can copy */
  code: string;
  /** React element for live preview */
  preview: React.ReactNode;
}

/**
 * Category metadata
 */
export interface ICategoryInfo {
  id: SnippetCategory | 'all';
  title: string;
  icon: string;
  color: string;
}

/**
 * All available categories
 */
export const CATEGORIES: ICategoryInfo[] = [
  { id: 'all', title: 'All Snippets', icon: 'ViewAll', color: '#0078d4' },
  { id: 'feedback', title: 'Feedback', icon: 'Message', color: '#107c10' },
  { id: 'layout', title: 'Layout', icon: 'GridViewMedium', color: '#8764b8' },
  { id: 'flex', title: 'Flexbox', icon: 'RowsChild', color: '#ca5010' },
  { id: 'patterns', title: 'Patterns', icon: 'Design', color: '#038387' },
  { id: 'interactive', title: 'Interactive', icon: 'Touch', color: '#c239b3' },
  { id: 'navigation', title: 'Navigation', icon: 'Nav2DMapView', color: '#005a9e' },
  { id: 'data', title: 'Data Display', icon: 'Table', color: '#498205' },
  { id: 'forms', title: 'Forms', icon: 'EditNote', color: '#8e562e' },
  { id: 'sharepoint', title: 'SharePoint', icon: 'SharepointLogo', color: '#038387' },
];
