// Export all snippets

import { ISnippet } from '../types';
import { feedbackSnippets } from './feedbackSnippets';
import { layoutSnippets } from './layoutSnippets';
import { flexSnippets } from './flexSnippets';
import { patternSnippets } from './patternSnippets';
import { interactiveSnippets } from './interactiveSnippets';
import { commonSnippets } from './commonSnippets';

export const allSnippets: ISnippet[] = [
  ...feedbackSnippets,
  ...layoutSnippets,
  ...flexSnippets,
  ...patternSnippets,
  ...commonSnippets,
  ...interactiveSnippets,
];

export {
  feedbackSnippets,
  layoutSnippets,
  flexSnippets,
  patternSnippets,
  interactiveSnippets,
  commonSnippets,
};
