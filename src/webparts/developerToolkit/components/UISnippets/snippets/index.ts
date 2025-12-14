// Export all snippets

import { ISnippet } from '../types';
import { feedbackSnippets } from './feedbackSnippets';
import { layoutSnippets } from './layoutSnippets';
import { flexSnippets } from './flexSnippets';
import { patternSnippets } from './patternSnippets';
import { interactiveSnippets } from './interactiveSnippets';
import { commonSnippets } from './commonSnippets';
import { navigationSnippets } from './navigationSnippets';
import { dataSnippets } from './dataSnippets';
import { formsSnippets } from './formsSnippets';
import { sharepointSnippets } from './sharepointSnippets';

export const allSnippets: ISnippet[] = [
  ...feedbackSnippets,
  ...layoutSnippets,
  ...flexSnippets,
  ...patternSnippets,
  ...commonSnippets,
  ...interactiveSnippets,
  ...navigationSnippets,
  ...dataSnippets,
  ...formsSnippets,
  ...sharepointSnippets,
];

export {
  feedbackSnippets,
  layoutSnippets,
  flexSnippets,
  patternSnippets,
  interactiveSnippets,
  commonSnippets,
  navigationSnippets,
  dataSnippets,
  formsSnippets,
  sharepointSnippets,
};
