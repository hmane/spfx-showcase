// src/components/DeveloperUtilities/types/UtilityTypes.ts

export interface BaseUtilityProps {
  id: string;
  title: string;
  shortcut?: string;
  description?: string;
}

export interface UtilityAction {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  tooltip?: string;
}

export interface CopyResult {
  success: boolean;
  message: string;
}

export interface PreferenceConfig<T = unknown> {
  key: string;
  defaultValue: T;
  validator?: (value: unknown) => boolean;
}

export interface UtilityPreferences {
  guid: {
    includeBrackets: boolean;
    uppercase: boolean;
    omitHyphens: boolean;
  };
  loremIpsum: {
    type: 'paragraphs' | 'sentences' | 'characters';
    count: number;
    mostRecent: string;
  };
  json: {
    autoMinify: boolean;
    formatMode: 'pretty' | 'minified';
    indentSize: number;
  };
  xml: {
    propertyOrder: string[];
    autoReorder: boolean;
  };
  typescript: {
    variableName: string;
  };
  pnpFieldSchema: {
    defaultGroup: string;
    lastFieldType: string;
    outputFormat: 'xml' | 'fieldref' | 'powershell' | 'json';
  };
}

export interface SharePointLimits {
  singleLineText: number;
  multiLineText: number;
  internalName: number;
  displayName: number;
  choiceOption: number;
}

export const SHAREPOINT_LIMITS: SharePointLimits = {
  singleLineText: 255,
  multiLineText: 63999,
  internalName: 32,
  displayName: 255,
  choiceOption: 255,
};

export interface TextCountResult {
  characters: number;
  words: number;
  lines: number;
  bytes: number;
  spLimits: {
    singleLine: { count: number; limit: number; valid: boolean };
    multiLine: { count: number; limit: number; valid: boolean };
    internalName: { count: number; limit: number; valid: boolean };
    displayName: { count: number; limit: number; valid: boolean };
    choiceOption: { count: number; limit: number; valid: boolean };
  };
}

export type UtilityCategory = 'Generators' | 'Formatters' | 'Analysis' | 'Text Tools' | 'Encoders';

export interface UtilityConfig {
  id: string;
  component: React.ComponentType<BaseUtilityProps>;
  title: string;
  description: string;
  category: UtilityCategory;
  tags: string[];
  shortcut: string;
  icon: string;
}
