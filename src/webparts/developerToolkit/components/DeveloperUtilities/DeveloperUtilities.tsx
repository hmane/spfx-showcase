// src/components/DeveloperUtilities/DeveloperUtilities.tsx

import {
  DefaultButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SearchBox,
  Toggle,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Import all utility components
import { ColorConverterUtility } from './utilities/ColorConverterUtility';
import { ContentTypeIdUtility } from './utilities/ContentTypeIdUtility';
import { CronExpressionUtility } from './utilities/CronExpressionUtility';
import { CssMinifierUtility } from './utilities/CssMinifierUtility';
import { CsvJsonConverterUtility } from './utilities/CsvJsonConverterUtility';
import { GuidGeneratorUtility } from './utilities/GuidGeneratorUtility';
import { JsonColumnFormatterUtility } from './utilities/JsonColumnFormatterUtility';
import { JsonFormatterUtility } from './utilities/JsonFormatterUtility';
import { JwtDecoderUtility } from './utilities/JwtDecoderUtility';
import { LoremIpsumUtility } from './utilities/LoremIpsumUtility';
import { PnpFieldSchemaUtility } from './utilities/PnpFieldSchemaUtility';
import { QueryStringUtility } from './utilities/QueryStringUtility';
import { TextEscapeUtility } from './utilities/TextEscapeUtility';
import { TypeScriptStringUtility } from './utilities/TypeScriptStringUtility';
import { UrlEncoderUtility } from './utilities/UrlEncoderUtility';
import { XmlFormatterUtility } from './utilities/XmlFormatterUtility';
// Context and Types
import { UtilityProvider } from './context/UtilityContext';
import { UtilityConfig } from './types/UtilityTypes';

// Styles
import styles from './DeveloperUtilities.module.scss';

export interface DeveloperUtilitiesProps {
  title?: string;
  description?: string;
}

const DeveloperUtilitiesContent: React.FC<DeveloperUtilitiesProps> = ({
  title = 'Developer Utilities',
  description = 'Essential tools for SharePoint and web development',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [showSystemMessage, setShowSystemMessage] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Define all available utilities with icons
  const utilities: UtilityConfig[] = useMemo(
    () => [
      {
        id: 'guid-generator',
        component: GuidGeneratorUtility,
        title: 'GUID Generator',
        description: 'Generate and copy GUIDs with bracket options',
        category: 'Generators',
        tags: ['guid', 'uuid', 'generator', 'sharepoint'],
        shortcut: 'Ctrl+G',
        icon: 'Fingerprint',
      },
      {
        id: 'lorem-ipsum',
        component: LoremIpsumUtility,
        title: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text by paragraphs, sentences, or characters',
        category: 'Generators',
        tags: ['lorem', 'ipsum', 'placeholder', 'text', 'generator'],
        shortcut: 'Ctrl+L',
        icon: 'Article',
      },
      {
        id: 'typescript-string',
        component: TypeScriptStringUtility,
        title: 'TypeScript String Generator',
        description: 'Convert multiline text to TypeScript template literals',
        category: 'Generators',
        tags: ['typescript', 'template', 'literal', 'string', 'multiline'],
        shortcut: 'Ctrl+S',
        icon: 'CodeEdit',
      },
      {
        id: 'json-formatter',
        component: JsonFormatterUtility,
        title: 'JSON Formatter',
        description: 'Format, validate, and minify JSON data',
        category: 'Formatters',
        tags: ['json', 'format', 'validate', 'minify', 'api'],
        shortcut: 'Ctrl+J',
        icon: 'FileCode',
      },
      {
        id: 'xml-formatter',
        component: XmlFormatterUtility,
        title: 'XML Formatter',
        description: 'Format XML with SharePoint PnP optimization',
        category: 'Formatters',
        tags: ['xml', 'format', 'sharepoint', 'pnp', 'provisioning'],
        shortcut: 'Ctrl+X',
        icon: 'BracketCurly',
      },
      {
        id: 'css-minifier',
        component: CssMinifierUtility,
        title: 'CSS Minifier',
        description: 'Minify CSS to reduce file size with comment removal and optimization',
        category: 'Formatters',
        tags: ['css', 'minify', 'compress', 'optimization', 'stylesheet'],
        shortcut: 'Ctrl+M',
        icon: 'Compress',
      },

      {
        id: 'text-escape',
        component: TextEscapeUtility,
        title: 'Text Escape/Unescape',
        description: 'Escape and unescape text for various contexts',
        category: 'Text Tools',
        tags: ['escape', 'unescape', 'html', 'javascript', 'xml', 'csv'],
        shortcut: 'Ctrl+E',
        icon: 'Quote',
      },
      {
        id: 'querystring-parser',
        component: QueryStringUtility,
        title: 'Query String Parser',
        description: 'Parse and decode URL query strings - extract parameters from SharePoint URLs',
        category: 'Encoders',
        tags: ['url', 'querystring', 'parse', 'decode', 'sharepoint', 'parameters'],
        shortcut: 'Ctrl+Q',
        icon: 'Variable',
      },
      {
        id: 'url-encoder',
        component: UrlEncoderUtility,
        title: 'URL Encoder/Decoder',
        description: 'Encode and decode URLs with multiple encoding types',
        category: 'Encoders',
        tags: ['url', 'encode', 'decode', 'uri', 'component', 'form'],
        shortcut: 'Ctrl+U',
        icon: 'Link',
      },
      {
        id: 'color-converter',
        component: ColorConverterUtility,
        title: 'Color Converter',
        description: 'Convert between HEX, RGB, HSL color formats with WCAG contrast checker',
        category: 'Generators',
        tags: ['color', 'hex', 'rgb', 'hsl', 'wcag', 'accessibility', 'contrast'],
        shortcut: 'Ctrl+K',
        icon: 'Color',
      },
      {
        id: 'content-type-id',
        component: ContentTypeIdUtility,
        title: 'Content Type ID Generator',
        description: 'Generate and parse SharePoint Content Type IDs',
        category: 'Generators',
        tags: ['sharepoint', 'content type', 'id', 'generator'],
        shortcut: 'Ctrl+Shift+C',
        icon: 'FileTemplate',
      },
      {
        id: 'pnp-field-schema',
        component: PnpFieldSchemaUtility,
        title: 'PnP Field Schema Generator',
        description: 'Generate SharePoint PnP field schemas with parameterization support',
        category: 'Generators',
        tags: ['sharepoint', 'pnp', 'field', 'schema', 'provisioning', 'xml', 'powershell'],
        shortcut: 'Ctrl+Shift+F',
        icon: 'FieldEmpty',
      },
      {
        id: 'jwt-decoder',
        component: JwtDecoderUtility,
        title: 'JWT Decoder',
        description: 'Decode and validate JSON Web Tokens',
        category: 'Analysis',
        tags: ['jwt', 'token', 'decode', 'authentication', 'security'],
        shortcut: 'Ctrl+Shift+J',
        icon: 'Permissions',
      },
      {
        id: 'csv-json-converter',
        component: CsvJsonConverterUtility,
        title: 'CSV ↔ JSON Converter',
        description: 'Convert between CSV and JSON formats',
        category: 'Formatters',
        tags: ['csv', 'json', 'convert', 'data', 'format'],
        shortcut: 'Ctrl+Shift+V',
        icon: 'Table',
      },
      {
        id: 'cron-expression',
        component: CronExpressionUtility,
        title: 'Cron Expression Generator',
        description: 'Build and understand cron expressions for scheduled tasks',
        category: 'Generators',
        tags: ['cron', 'schedule', 'timer', 'automation'],
        shortcut: 'Ctrl+Shift+R',
        icon: 'Clock',
      },
      {
        id: 'json-column-formatter',
        component: JsonColumnFormatterUtility,
        title: 'JSON Column Formatter',
        description:
          'Create SharePoint column formatting JSON with templates and live preview',
        category: 'Generators',
        tags: ['sharepoint', 'json', 'column', 'formatter', 'template', 'list', 'view'],
        shortcut: 'Ctrl+Shift+O',
        icon: 'ViewList',
      },
    ],
    []
  );

  // Filter utilities based on search term
  const filteredUtilities = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return utilities.filter(utility => {
      const matchesCategory = selectedCategory === 'all' || utility.category === selectedCategory;
      const matchesSearch =
        !searchLower ||
        utility.title.toLowerCase().includes(searchLower) ||
        utility.description.toLowerCase().includes(searchLower) ||
        utility.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        utility.category.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [utilities, searchTerm, selectedCategory]);

  // Group utilities by category
  const categorizedUtilities = useMemo(() => {
    const categories: { [key: string]: UtilityConfig[] } = {};
    filteredUtilities.forEach(utility => {
      if (!categories[utility.category]) {
        categories[utility.category] = [];
      }
      categories[utility.category].push(utility);
    });
    return categories;
  }, [filteredUtilities]);

  // Handle search
  const handleSearch = useCallback((newValue?: string): void => {
    setSearchTerm(newValue || '');
  }, []);

  // Clear search
  const clearSearch = useCallback((): void => {
    setSearchTerm('');
  }, []);

  // Toggle compact mode
  const handleCompactModeChange = useCallback(
    (ev: React.MouseEvent<HTMLElement>, checked?: boolean): void => {
      setIsCompactMode(checked || false);
    },
    []
  );

  // Show system message
  const messageTimeoutRef = useRef<number>();
  const showMessage = useCallback((message: string): void => {
    setSystemMessage(message);
    setShowSystemMessage(true);

    if (messageTimeoutRef.current !== undefined) {
      window.clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      setShowSystemMessage(false);
      messageTimeoutRef.current = undefined;
    }, 4000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current !== undefined) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const categoriesWithCount = useMemo(() => {
    const counts = new Map<string, number>();
    utilities.forEach(utility => {
      counts.set(utility.category, (counts.get(utility.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [utilities]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(prev => (prev === category ? 'all' : category));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    showMessage('Filters reset');
  }, [showMessage]);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleGlobalShortcuts = (event: KeyboardEvent): void => {
      // Help shortcut (Ctrl+/)
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        showMessage('Available shortcuts: ' + utilities.map(u => u.shortcut).join(', '));
      }

      // Search shortcut (Ctrl+F)
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        const searchBox = document.querySelector(
          '[data-automation-id="SearchBox"] input'
        ) as HTMLInputElement;
        if (searchBox) {
          event.preventDefault();
          searchBox.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      document.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [showMessage, utilities]);

  // Get responsive grid class
  const getGridClass = (): string => {
    return isCompactMode
      ? `${styles['dev-utilities-grid']} ${styles['dev-utilities-grid--compact']}`
      : styles['dev-utilities-grid'];
  };

  const totalUtilities = utilities.length;
  const hasActiveFilters = selectedCategory !== 'all' || Boolean(searchTerm);

  return (
    <div className={styles['dev-utilities-container']}>
      <a href='#main-content' className={styles['skip-to-content']}>
        Skip to content
      </a>

      <section
        className={styles['dev-utilities-hero']}
        style={{
          background: 'linear-gradient(135deg, #2234AE 0%, #191714 100%)',
        }}
      >
        <div className={styles['dev-utilities-heroTop']}>
          <div className={styles['dev-utilities-heroTitle']}>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <div className={styles['dev-utilities-heroControls']}>
          <div className={styles['dev-utilities-heroControlCard']}>
            <div className={styles['dev-utilities-heroControlSearch']}>
              <SearchBox
                placeholder='Search utilities by name, description, or tags...'
                value={searchTerm}
                onChange={(ev, newValue) => handleSearch(newValue)}
                onClear={clearSearch}
                ariaLabel='Search utilities'
              />
            </div>

            <div className={styles['dev-utilities-heroControlGroup']}>
              <Toggle
                label='Compact layout'
                checked={isCompactMode}
                onChange={handleCompactModeChange}
                inlineLabel
              />

              <DefaultButton
                text='Reset filters'
                iconProps={{ iconName: 'Refresh' }}
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                title='Clear search and category filters'
                ariaLabel='Reset search and filters'
              />
            </div>
          </div>
        </div>

        <div
          className={styles['dev-utilities-heroFilters']}
          role='list'
          aria-label='Filter utilities by category'
        >
          <button
            type='button'
            className={`${styles['dev-utilities-filterChip']} ${
              selectedCategory === 'all' ? styles['dev-utilities-filterChip--active'] : ''
            }`}
            aria-pressed={selectedCategory === 'all'}
            role='listitem'
            onClick={() => setSelectedCategory('all')}
          >
            All utilities <span>{totalUtilities}</span>
          </button>
          {categoriesWithCount.map(category => (
            <button
              key={category.name}
              type='button'
              className={`${styles['dev-utilities-filterChip']} ${
                selectedCategory === category.name ? styles['dev-utilities-filterChip--active'] : ''
              }`}
              aria-pressed={selectedCategory === category.name}
              role='listitem'
              onClick={() => handleCategorySelect(category.name)}
            >
              {category.name} <span>{category.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* System Messages */}
      {showSystemMessage && (
        <MessageBar
          messageBarType={MessageBarType.info}
          isMultiline={false}
          onDismiss={() => setShowSystemMessage(false)}
          dismissButtonAriaLabel='Close'
          role='alert'
          aria-live='polite'
        >
          {systemMessage}
        </MessageBar>
      )}

      {/* No Results */}
      {filteredUtilities.length === 0 && (
        <div className={styles['dev-utilities-no-results']} role='status' aria-live='polite'>
          <div className={styles['dev-utilities-no-results-content']}>
            <h3>No utilities found</h3>
            <p>Try adjusting your search terms or clear the search to see all utilities.</p>
            <PrimaryButton
              text='Reset filters'
              iconProps={{ iconName: 'Refresh' }}
              onClick={handleResetFilters}
            />
          </div>
        </div>
      )}

      {/* Utilities Grid */}
      <main id='main-content'>
        {filteredUtilities.length > 0 && (
          <div className={getGridClass()}>
            {Object.keys(categorizedUtilities).map(category => (
              <section
                key={category}
                className={styles['dev-utilities-category']}
                data-category={category}
                aria-labelledby={`category-${category}`}
              >
                <div className={styles['dev-utilities-category-header']}>
                  <h3 id={`category-${category}`}>{category}</h3>
                  <span className={styles['dev-utilities-category-count']}>
                    {categorizedUtilities[category].length} tool
                    {categorizedUtilities[category].length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className={styles['dev-utilities-category-grid']}>
                  {categorizedUtilities[category].map(utility => {
                    const UtilityComponent = utility.component;
                    return (
                      <div
                        key={utility.id}
                        className={styles['dev-utilities-item']}
                        data-utility-id={utility.id}
                      >
                        <UtilityComponent
                          id={utility.id}
                          title={utility.title}
                          shortcut={utility.shortcut}
                          description={utility.description}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles['dev-utilities-footer']}>
        <div className={styles['dev-utilities-footer-content']}>
          <div className={styles['dev-utilities-footer-stats']}>
            <span>{utilities.length} utilities available</span>
            <span>Press Ctrl+/ for keyboard shortcuts</span>
            <span>Press Ctrl+F to search</span>
          </div>

          <div className={styles['dev-utilities-footer-info']}>
            <span>Built for SharePoint Framework development</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const DeveloperUtilities: React.FC<DeveloperUtilitiesProps> = props => {
  return (
    <UtilityProvider>
      <DeveloperUtilitiesContent {...props} />
    </UtilityProvider>
  );
};
