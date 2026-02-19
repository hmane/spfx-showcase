// src/components/DeveloperUtilities/services/UtilityService.ts

import { CopyResult, UtilityPreferences } from '../types/UtilityTypes';

export class UtilityService {
  private static instance: UtilityService;
  private readonly storageKey = 'spfx-dev-utilities-preferences';
  private activeTimeouts: Set<number> = new Set();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): UtilityService {
    if (!UtilityService.instance) {
      UtilityService.instance = new UtilityService();
    }
    return UtilityService.instance;
  }

  // Clipboard operations
  public async copyToClipboard(text: string): Promise<CopyResult> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return { success: true, message: 'Copied to clipboard!' };
      } else {
        // Fallback for older browsers
        return this.fallbackCopy(text);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      return { success: false, message: 'Failed to copy to clipboard' };
    }
  }

  private fallbackCopy(text: string): CopyResult {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);

      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        return { success: true, message: 'Copied to clipboard!' };
      } else {
        throw new Error('Copy command failed');
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return { success: false, message: 'Failed to copy to clipboard' };
    }
  }

  // Preferences management
  public getPreferences(): UtilityPreferences {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UtilityPreferences>;
        return { ...this.getDefaultPreferences(), ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
    return this.getDefaultPreferences();
  }

  public savePreferences(preferences: Partial<UtilityPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  }

  public getPreference<K extends keyof UtilityPreferences>(
    category: K,
    key: keyof UtilityPreferences[K]
  ): UtilityPreferences[K][keyof UtilityPreferences[K]] {
    const prefs = this.getPreferences();
    return prefs[category][key];
  }

  public savePreference<K extends keyof UtilityPreferences>(
    category: K,
    key: keyof UtilityPreferences[K],
    value: UtilityPreferences[K][keyof UtilityPreferences[K]]
  ): void {
    const prefs = this.getPreferences();
    prefs[category] = { ...prefs[category], [key]: value };
    this.savePreferences({ [category]: prefs[category] } as Partial<UtilityPreferences>);
  }

  private getDefaultPreferences(): UtilityPreferences {
    return {
      guid: {
        includeBrackets: false,
        uppercase: false,
        omitHyphens: false,
      },
      loremIpsum: {
        type: 'paragraphs',
        count: 3,
        mostRecent: '',
      },
      json: {
        autoMinify: false,
        formatMode: 'pretty',
        indentSize: 2,
      },
      xml: {
        propertyOrder: [
          'ID',
          'Type',
          'InternalName',
          'DisplayName',
          'Name',
          'Description',
          'Required',
          'Hidden',
          'ReadOnly',
          'Group',
          'StaticName',
          'SourceID',
          'Version',
        ],
        autoReorder: true,
      },
      typescript: {
        variableName: 'myVar',
      },
      pnpFieldSchema: {
        defaultGroup: 'Custom Columns',
        lastFieldType: 'Text',
        outputFormat: 'xml',
      },
    };
  }

  // Utility functions
  public generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | undefined;
    return (...args: Parameters<T>) => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
        this.activeTimeouts.delete(timeout);
      }
      timeout = window.setTimeout(() => {
        func(...args);
        if (timeout !== undefined) {
          this.activeTimeouts.delete(timeout);
        }
      }, wait);
      this.activeTimeouts.add(timeout);
    };
  }

  public createManagedTimeout(callback: () => void, delay: number): () => void {
    const timeout = window.setTimeout(callback, delay);
    this.activeTimeouts.add(timeout);

    return () => {
      window.clearTimeout(timeout);
      this.activeTimeouts.delete(timeout);
    };
  }

  public clearAllTimeouts(): void {
    this.activeTimeouts.forEach(timeout => {
      window.clearTimeout(timeout);
    });
    this.activeTimeouts.clear();
  }

  public isValidJson(text: string): boolean {
    if (!text.trim()) return false;
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  public isValidXml(text: string): boolean {
    if (!text.trim()) return false;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'application/xml');
      return !doc.documentElement.querySelector('parsererror');
    } catch {
      return false;
    }
  }

  // Keyboard shortcut management
  public setupGlobalShortcuts(shortcuts: Map<string, () => void>): () => void {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();
        const shortcutKey = event.shiftKey ? `ctrl+shift+${key}` : `ctrl+${key}`;

        if (shortcuts.has(shortcutKey)) {
          event.preventDefault();
          event.stopPropagation();
          const handler = shortcuts.get(shortcutKey);
          if (handler) {
            handler();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }

  // Text utilities
  public countWords(text: string): number {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  public countLines(text: string): number {
    return text.split(/\r\n|\r|\n/).length;
  }

  public getByteSize(text: string): number {
    return new Blob([text]).size;
  }

  public sanitizeVariableName(name: string): string {
    const sanitized = name.replace(/[^a-zA-Z0-9_$]/g, '');
    if (!sanitized) return 'myVar';
    if (/^\d/.test(sanitized)) return `_${sanitized}`;
    return sanitized;
  }
}
