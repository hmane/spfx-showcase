// Schema Explorer - Main Component

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MessageBar, MessageBarType, TextField, PrimaryButton, Icon } from '@fluentui/react';

import { CategoryNav, CATEGORIES } from './components/CategoryNav';
import { ItemSelectionPanel } from './components/ItemSelectionPanel';
import { SchemaPreviewPanel } from './components/SchemaPreviewPanel';
import { SchemaService } from './services/SchemaService';
import { generateSchema, ISchemaGeneratorInput } from './utils/schemaGenerators';
import {
  SchemaCategory,
  ExportFormat,
  SchemaItem,
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
  IGroupSchema,
  IPermissionLevelSchema,
  INavigationSchema,
  ISiteSettingsSchema,
} from './types/SchemaTypes';

export interface ISchemaExplorerProps {
  context: WebPartContext;
}

export const SchemaExplorer: React.FC<ISchemaExplorerProps> = ({ context }) => {
  // Site URL state
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Services - recreate when site URL changes
  const schemaService = useMemo(() => new SchemaService(context, siteUrl || undefined), [context, siteUrl]);

  // Data state
  const [siteColumns, setSiteColumns] = useState<ISiteColumnSchema[]>([]);
  const [contentTypes, setContentTypes] = useState<IContentTypeSchema[]>([]);
  const [lists, setLists] = useState<IListSchema[]>([]);
  const [groups, setGroups] = useState<IGroupSchema[]>([]);
  const [permissionLevels, setPermissionLevels] = useState<IPermissionLevelSchema[]>([]);
  const [navigation, setNavigation] = useState<INavigationSchema[]>([]);
  const [siteSettings, setSiteSettings] = useState<ISiteSettingsSchema[]>([]);

  // UI state
  const [selectedCategories, setSelectedCategories] = useState<SchemaCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<SchemaCategory | null>(null);
  const [selectedItems, setSelectedItems] = useState<Map<SchemaCategory, Set<string>>>(new Map());
  const [loadingCategories, setLoadingCategories] = useState<SchemaCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pnp-json');
  const [generatedSchema, setGeneratedSchema] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load site columns by default on mount (to show current site is ready)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Set Lists as default active category and load it
      setActiveCategory('lists');
      setSelectedCategories(['lists']);
      void (async () => {
        setLoadingCategories(['lists']);
        try {
          const ls = await schemaService.getLists();
          setLists(ls);
        } catch (err: any) {
          setError(`Failed to load lists: ${err.message}`);
        } finally {
          setLoadingCategories([]);
        }
      })();
    }
  }, [isInitialized, schemaService]);

  // Get items for current active category
  const currentItems = useMemo((): SchemaItem[] => {
    if (!activeCategory) return [];

    switch (activeCategory) {
      case 'siteColumns':
        return siteColumns;
      case 'contentTypes':
        return contentTypes;
      case 'lists':
        return lists;
      case 'security':
        return [...groups, ...permissionLevels];
      case 'navigation':
        return navigation;
      case 'siteSettings':
        return siteSettings;
      default:
        return [];
    }
  }, [activeCategory, siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings]);

  // Get current selected items set
  const currentSelectedItems = useMemo((): Set<string> => {
    return selectedItems.get(activeCategory || 'siteColumns') || new Set();
  }, [selectedItems, activeCategory]);

  // Calculate item counts per category
  const itemCounts = useMemo((): Record<SchemaCategory, number> => {
    return {
      siteSettings: siteSettings.length,
      siteColumns: siteColumns.length,
      contentTypes: contentTypes.length,
      lists: lists.length,
      security: groups.length + permissionLevels.length,
      navigation: navigation.length,
      branding: 0,
      taxonomy: 0,
    };
  }, [siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings]);

  // Calculate selected counts per category
  const selectedCounts = useMemo((): Record<SchemaCategory, number> => {
    const counts: Record<SchemaCategory, number> = {
      siteSettings: 0,
      siteColumns: 0,
      contentTypes: 0,
      lists: 0,
      security: 0,
      navigation: 0,
      branding: 0,
      taxonomy: 0,
    };

    selectedItems.forEach((items, category) => {
      counts[category] = items.size;
    });

    return counts;
  }, [selectedItems]);

  // Total selected items count
  const totalSelectedItems = useMemo(() => {
    let count = 0;
    selectedItems.forEach(items => {
      count += items.size;
    });
    return count;
  }, [selectedItems]);

  // Load category data
  const loadCategory = useCallback(async (category: SchemaCategory) => {
    if (loadingCategories.includes(category)) return;

    setLoadingCategories(prev => [...prev, category]);
    setError(null);

    try {
      switch (category) {
        case 'siteColumns':
          if (siteColumns.length === 0) {
            const cols = await schemaService.getSiteColumns();
            setSiteColumns(cols);
          }
          break;
        case 'contentTypes':
          if (contentTypes.length === 0) {
            const cts = await schemaService.getContentTypes();
            setContentTypes(cts);
          }
          break;
        case 'lists':
          if (lists.length === 0) {
            const ls = await schemaService.getLists();
            setLists(ls);
          }
          break;
        case 'security':
          if (groups.length === 0) {
            const grps = await schemaService.getGroups();
            setGroups(grps);
          }
          if (permissionLevels.length === 0) {
            const perms = await schemaService.getPermissionLevels();
            setPermissionLevels(perms);
          }
          break;
        case 'navigation':
          if (navigation.length === 0) {
            const nav = await schemaService.getNavigation();
            setNavigation(nav);
          }
          break;
        case 'siteSettings':
          if (siteSettings.length === 0) {
            const settings = await schemaService.getSiteSettings();
            setSiteSettings(settings);
          }
          break;
      }
    } catch (err) {
      setError(`Failed to load ${category}: ${err.message}`);
    } finally {
      setLoadingCategories(prev => prev.filter(c => c !== category));
    }
  }, [loadingCategories, siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings, schemaService]);

  // Handle category toggle
  const handleCategoryToggle = useCallback((category: SchemaCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        // Load data when category is selected
        void loadCategory(category);
        return [...prev, category];
      }
    });

    // Set as active category for viewing
    setActiveCategory(category);
    void loadCategory(category);
  }, [loadCategory]);

  // Handle select all categories
  const handleSelectAllCategories = useCallback(() => {
    const allCategories = CATEGORIES.map(c => c.id);
    setSelectedCategories(allCategories);
    allCategories.forEach(cat => void loadCategory(cat));
  }, [loadCategory]);

  // Handle clear all categories
  const handleClearAllCategories = useCallback(() => {
    setSelectedCategories([]);
    setSelectedItems(new Map());
  }, []);

  // Handle item toggle
  const handleItemToggle = useCallback((itemId: string) => {
    if (!activeCategory) return;

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const categoryItems = new Set(newMap.get(activeCategory) || []);

      if (categoryItems.has(itemId)) {
        categoryItems.delete(itemId);
      } else {
        categoryItems.add(itemId);
      }

      newMap.set(activeCategory, categoryItems);
      return newMap;
    });
  }, [activeCategory]);

  // Handle select all items in current category
  const handleSelectAllItems = useCallback(() => {
    if (!activeCategory) return;

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const allIds = new Set(currentItems.map(item => item.id));
      newMap.set(activeCategory, allIds);
      return newMap;
    });
  }, [activeCategory, currentItems]);

  // Handle clear all items in current category
  const handleClearAllItems = useCallback(() => {
    if (!activeCategory) return;

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      newMap.set(activeCategory, new Set());
      return newMap;
    });
  }, [activeCategory]);

  // Handle select dependencies (for content types)
  const handleSelectDependencies = useCallback((itemId: string) => {
    const contentType = contentTypes.find(ct => ct.id === itemId);
    if (!contentType) return;

    // Get field IDs from field links
    const fieldIds = contentType.fieldLinks.map(fl => fl.id);

    // Select corresponding site columns
    const matchingColumns = siteColumns.filter(col => fieldIds.includes(col.id));

    if (matchingColumns.length > 0) {
      setSelectedItems(prev => {
        const newMap = new Map(prev);
        const columnItems = new Set(newMap.get('siteColumns') || []);
        matchingColumns.forEach(col => columnItems.add(col.id));
        newMap.set('siteColumns', columnItems);
        return newMap;
      });

      // Make sure siteColumns is in selected categories
      setSelectedCategories(prev => {
        if (!prev.includes('siteColumns')) {
          return [...prev, 'siteColumns'];
        }
        return prev;
      });

      setMessage(`Added ${matchingColumns.length} site columns as dependencies`);
      setTimeout(() => setMessage(''), 3000);
    }
  }, [contentTypes, siteColumns]);

  // Generate schema when selection or format changes
  useEffect(() => {
    // Gather all selected items
    const input: ISchemaGeneratorInput = {
      siteColumns: siteColumns.filter(col => selectedItems.get('siteColumns')?.has(col.id)),
      contentTypes: contentTypes.filter(ct => selectedItems.get('contentTypes')?.has(ct.id)),
      lists: lists.filter(list => selectedItems.get('lists')?.has(list.id)),
      groups: groups.filter(g => selectedItems.get('security')?.has(g.id)),
      permissionLevels: permissionLevels.filter(p => selectedItems.get('security')?.has(p.id)),
      navigation: navigation.filter(n => selectedItems.get('navigation')?.has(n.id)),
      siteSettings: siteSettings.filter(s => selectedItems.get('siteSettings')?.has(s.id)),
    };

    // Check if anything is selected
    const hasSelection = Object.values(input).some(arr => arr.length > 0);

    if (hasSelection) {
      const schema = generateSchema(input, exportFormat);
      setGeneratedSchema(schema);
    } else {
      setGeneratedSchema('');
    }
  }, [selectedItems, exportFormat, siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings]);

  // Handle copy success
  const handleCopySuccess = useCallback(() => {
    setMessage('Schema copied to clipboard');
    setTimeout(() => setMessage(''), 3000);
  }, []);

  // Handle site URL change and connect
  const handleConnectToSite = useCallback(async () => {
    // Clear existing data when connecting to a new site
    setSiteColumns([]);
    setContentTypes([]);
    setLists([]);
    setGroups([]);
    setPermissionLevels([]);
    setNavigation([]);
    setSiteSettings([]);
    setSelectedCategories([]);
    setSelectedItems(new Map());

    if (!siteUrl.trim()) {
      setMessage('Connected to current site');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      setMessage(`Connected to ${siteUrl}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [siteUrl]);

  // Get current site display name
  const currentSiteDisplay = useMemo(() => {
    if (siteUrl) {
      return siteUrl;
    }
    return context.pageContext.web.absoluteUrl;
  }, [siteUrl, context.pageContext.web.absoluteUrl]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #edebe9',
          background: '#faf9f8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Schema Explorer
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Explore, select, and export SharePoint site schemas for provisioning
            </p>
          </div>
        </div>

        {/* Site URL Input */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <TextField
            label="Site URL (leave empty for current site)"
            placeholder={context.pageContext.web.absoluteUrl}
            value={siteUrl}
            onChange={(_, value) => setSiteUrl(value || '')}
            styles={{ root: { flex: 1, maxWidth: '500px' } }}
          />
          <PrimaryButton
            text={isConnecting ? 'Connecting...' : 'Connect'}
            onClick={() => void handleConnectToSite()}
            disabled={isConnecting}
            iconProps={{ iconName: 'PlugConnected' }}
          />
        </div>

        {/* Current site indicator */}
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#107c10', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon iconName="CheckMark" />
          <span>Connected to: {currentSiteDisplay}</span>
        </div>
      </div>

      {/* Message bar */}
      {message && (
        <MessageBar
          messageBarType={MessageBarType.success}
          onDismiss={() => setMessage('')}
        >
          {message}
        </MessageBar>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Category Navigation */}
        <CategoryNav
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onSelectAll={handleSelectAllCategories}
          onClearAll={handleClearAllCategories}
          loadingCategories={loadingCategories}
          itemCounts={itemCounts}
          selectedCounts={selectedCounts}
        />

        {/* Center: Item Selection */}
        <ItemSelectionPanel
          activeCategory={activeCategory}
          items={currentItems}
          selectedItems={currentSelectedItems}
          onItemToggle={handleItemToggle}
          onSelectAll={handleSelectAllItems}
          onClearAll={handleClearAllItems}
          onSelectDependencies={handleSelectDependencies}
          isLoading={activeCategory ? loadingCategories.includes(activeCategory) : false}
          error={error}
        />

        {/* Right: Schema Preview */}
        <SchemaPreviewPanel
          generatedSchema={generatedSchema}
          exportFormat={exportFormat}
          onFormatChange={setExportFormat}
          selectedCategoriesCount={selectedCategories.length}
          selectedItemsCount={totalSelectedItems}
          onExport={() => {}}
          onCopy={handleCopySuccess}
          isGenerating={false}
        />
      </div>
    </div>
  );
};

export default SchemaExplorer;
