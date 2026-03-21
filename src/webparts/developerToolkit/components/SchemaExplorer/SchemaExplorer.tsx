// Schema Explorer - Main Component

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  Stack,
  MessageBar,
  MessageBarType,
  TextField,
  PrimaryButton,
  DefaultButton,
  Icon,
  CommandBar,
  ICommandBarItemProps,
} from '@fluentui/react';

import { CategoryNav, CATEGORIES } from './components/CategoryNav';
import { ItemSelectionPanel } from './components/ItemSelectionPanel';
import { SchemaPreviewPanel } from './components/SchemaPreviewPanel';
import { SchemaComparison } from './components/SchemaComparison';
import { ImportTemplate } from './components/ImportTemplate';
import { SchemaValidation } from './components/SchemaValidation';
import { SchemaPresets, ISchemaPreset } from './components/SchemaPresets';
import { ListDetailsPanel } from './components/ListDetailsPanel';
import { BatchSelection } from './components/BatchSelection';
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
  IBrandingSchema,
  ITaxonomySchema,
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
  const [branding, setBranding] = useState<IBrandingSchema[]>([]);
  const [taxonomy, setTaxonomy] = useState<ITaxonomySchema[]>([]);

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

  // Modal states for new features
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [showBatchSelection, setShowBatchSelection] = useState<boolean>(false);
  const [selectedListForDetails, setSelectedListForDetails] = useState<IListSchema | null>(null);

  const clearTransientMessage = useCallback(() => {
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const loadInitialCategory = useCallback(async (): Promise<void> => {
    setActiveCategory('lists');
    setSelectedCategories(['lists']);
    setLoadingCategories(['lists']);
    setError(null);

    try {
      const ls = await schemaService.getLists();
      setLists(ls);
    } catch (err: any) {
      setError(`Failed to load lists: ${err.message}`);
    } finally {
      setLoadingCategories([]);
    }
  }, [schemaService]);

  // Load site columns by default on mount (to show current site is ready)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      void loadInitialCategory();
    }
  }, [isInitialized, loadInitialCategory]);

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
      case 'branding':
        return branding;
      case 'taxonomy':
        return taxonomy;
      default:
        return [];
    }
  }, [activeCategory, siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings, branding, taxonomy]);

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
      branding: branding.length,
      taxonomy: taxonomy.length,
    };
  }, [siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings, branding, taxonomy]);

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
        case 'branding':
          if (branding.length === 0) {
            const brand = await schemaService.getBranding();
            setBranding(brand);
          }
          break;
        case 'taxonomy':
          if (taxonomy.length === 0) {
            const tax = await schemaService.getTaxonomy();
            setTaxonomy(tax);
          }
          break;
      }
    } catch (err: any) {
      setError(`Failed to load ${category}: ${err.message}`);
    } finally {
      setLoadingCategories(prev => prev.filter(c => c !== category));
    }
  }, [loadingCategories, siteColumns, contentTypes, lists, groups, permissionLevels, navigation, siteSettings, branding, taxonomy, schemaService]);

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
      clearTransientMessage();
    }
  }, [clearTransientMessage, contentTypes, siteColumns]);

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
    clearTransientMessage();
  }, [clearTransientMessage]);

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
    setBranding([]);
    setTaxonomy([]);
    setSelectedCategories([]);
    setSelectedItems(new Map());

    if (!siteUrl.trim()) {
      await loadInitialCategory();
      setMessage('Connected to current site');
      clearTransientMessage();
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await loadInitialCategory();
      setMessage(`Connected to ${siteUrl}`);
      clearTransientMessage();
    } catch (err: any) {
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [clearTransientMessage, loadInitialCategory, siteUrl]);

  // Get current site display name
  const currentSiteDisplay = useMemo(() => {
    if (siteUrl) {
      return siteUrl;
    }
    return context.pageContext.web.absoluteUrl;
  }, [siteUrl, context.pageContext.web.absoluteUrl]);

  const loadedCategoryCount = useMemo(() => {
    return Object.values(itemCounts).filter(count => count > 0).length;
  }, [itemCounts]);

  const activeCategoryInfo = useMemo(() => {
    return CATEGORIES.find(category => category.id === activeCategory) || null;
  }, [activeCategory]);

  const applyQuickPreset = useCallback((preset: 'foundation' | 'informationArchitecture' | 'listsOnly') => {
    let categories: SchemaCategory[];

    switch (preset) {
      case 'foundation':
        categories = ['siteSettings', 'navigation', 'security'];
        break;
      case 'informationArchitecture':
        categories = ['siteColumns', 'contentTypes', 'lists'];
        break;
      case 'listsOnly':
      default:
        categories = ['lists'];
        break;
    }

    setSelectedCategories(categories);
    setActiveCategory(categories[0]);
    categories.forEach(category => void loadCategory(category));

    setMessage(
      preset === 'foundation'
        ? 'Loaded foundation categories: site settings, navigation, and security'
        : preset === 'informationArchitecture'
          ? 'Loaded information architecture categories: columns, content types, and lists'
          : 'Focused explorer on lists and libraries'
    );
    clearTransientMessage();
  }, [clearTransientMessage, loadCategory]);

  // Handle applying a preset
  const handleApplyPreset = useCallback((preset: ISchemaPreset) => {
    const newSelectedItems = new Map<SchemaCategory, Set<string>>();
    const categoriesToSelect: SchemaCategory[] = [];

    Object.entries(preset.selections).forEach(([category, ids]) => {
      if (ids.length > 0) {
        newSelectedItems.set(category as SchemaCategory, new Set(ids));
        categoriesToSelect.push(category as SchemaCategory);
      }
    });

    setSelectedItems(newSelectedItems);
    setSelectedCategories(categoriesToSelect);
    setActiveCategory(categoriesToSelect[0] || 'lists');
    setExportFormat(preset.exportFormat as ExportFormat);
    setMessage(`Applied preset: ${preset.name}`);
    clearTransientMessage();
  }, [clearTransientMessage]);

  // Handle batch selection
  const handleBatchSelectionChange = useCallback((selectedIds: string[]) => {
    if (!activeCategory) return;

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      newMap.set(activeCategory, new Set(selectedIds));
      return newMap;
    });
  }, [activeCategory]);

  // Handle select missing items from validation
  const handleSelectMissing = useCallback((category: 'siteColumns' | 'contentTypes', ids: string[]) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const existingSet = new Set(newMap.get(category) || []);
      ids.forEach(id => existingSet.add(id));
      newMap.set(category, existingSet);
      return newMap;
    });

    // Ensure category is in selected categories
    setSelectedCategories(prev => {
      if (!prev.includes(category)) {
        return [...prev, category];
      }
      return prev;
    });

    setMessage(`Added ${ids.length} missing ${category === 'siteColumns' ? 'columns' : 'content types'}`);
    clearTransientMessage();
  }, [clearTransientMessage]);

  // Handle list details click (can be used in ItemSelectionPanel)
  const _handleListDetailsClick = useCallback((listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
      setSelectedListForDetails(list);
    }
  }, [lists]);
  void _handleListDetailsClick; // Kept for future use

  // Command bar items for new features
  const commandBarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: 'compare',
      text: 'Compare Sites',
      iconProps: { iconName: 'BranchCompare' },
      onClick: () => setShowComparison(true),
    },
    {
      key: 'import',
      text: 'Import Template',
      iconProps: { iconName: 'Upload' },
      onClick: () => setShowImport(true),
    },
    {
      key: 'presets',
      text: 'Presets',
      iconProps: { iconName: 'FavoriteList' },
      onClick: () => setShowPresets(true),
    },
    {
      key: 'validate',
      text: 'Validate',
      iconProps: { iconName: 'CheckList' },
      onClick: () => setShowValidation(true),
      disabled: totalSelectedItems === 0,
    },
  ], [totalSelectedItems]);

  const commandBarFarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: 'batchSelect',
      text: 'Batch Select',
      iconProps: { iconName: 'MultiSelect' },
      onClick: () => setShowBatchSelection(true),
      disabled: !activeCategory || currentItems.length === 0,
    },
  ], [activeCategory, currentItems.length]);

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

        <Stack horizontal wrap tokens={{ childrenGap: 10 }} style={{ marginTop: '14px' }}>
          {[
            { label: 'Loaded Categories', value: loadedCategoryCount, accent: '#2563eb' },
            { label: 'Selected Categories', value: selectedCategories.length, accent: '#7c3aed' },
            { label: 'Selected Items', value: totalSelectedItems, accent: '#047857' },
            { label: 'Export Format', value: exportFormat, accent: '#b45309' },
          ].map(card => (
            <div
              key={card.label}
              style={{
                minWidth: '150px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: `${card.accent}12`,
                border: `1px solid ${card.accent}30`,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: card.accent, textTransform: 'uppercase' }}>
                {card.label}
              </div>
              <div style={{ marginTop: '6px', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                {card.value}
              </div>
            </div>
          ))}
        </Stack>

        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#323130' }}>Quick Start:</span>
          <DefaultButton text="Lists Only" onClick={() => applyQuickPreset('listsOnly')} />
          <DefaultButton text="Info Architecture" onClick={() => applyQuickPreset('informationArchitecture')} />
          <DefaultButton text="Foundation" onClick={() => applyQuickPreset('foundation')} />
        </div>

        {/* Command bar for new features */}
        <CommandBar
          items={commandBarItems}
          farItems={commandBarFarItems}
          styles={{
            root: { marginTop: '12px', padding: 0, background: 'transparent' },
          }}
        />
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {activeCategoryInfo && (
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #edebe9',
                background: '#fcfcfb',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#323130' }}>
                  {activeCategoryInfo.title}
                </div>
                <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px' }}>
                  {activeCategoryInfo.description}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 10px', borderRadius: '999px', background: '#eef2ff', fontSize: '12px', color: '#4338ca', fontWeight: 600 }}>
                  {currentItems.length} loaded
                </span>
                <span style={{ padding: '6px 10px', borderRadius: '999px', background: '#ecfdf5', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                  {currentSelectedItems.size} selected
                </span>
                {activeCategory === 'contentTypes' && (
                  <span style={{ padding: '6px 10px', borderRadius: '999px', background: '#fff7ed', fontSize: '12px', color: '#c2410c', fontWeight: 600 }}>
                    Tip: use dependency selection for linked site columns
                  </span>
                )}
              </div>
            </div>
          )}

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
        </div>

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

      {/* Schema Comparison Modal */}
      {showComparison && (
        <SchemaComparison
          context={context}
          sourceSiteUrl={currentSiteDisplay}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Import Template Modal */}
      {showImport && (
        <ImportTemplate
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Schema Presets Modal */}
      {showPresets && (
        <SchemaPresets
          currentSelections={selectedItems}
          currentSiteUrl={currentSiteDisplay}
          currentExportFormat={exportFormat}
          onApplyPreset={handleApplyPreset}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* Batch Selection Modal */}
      {showBatchSelection && activeCategory && (
        <BatchSelection
          activeCategory={activeCategory}
          items={currentItems as (ISiteColumnSchema | IContentTypeSchema | IListSchema)[]}
          selectedItems={currentSelectedItems}
          onSelectionChange={handleBatchSelectionChange}
          onClose={() => setShowBatchSelection(false)}
        />
      )}

      {/* List Details Modal */}
      {selectedListForDetails && (
        <ListDetailsPanel
          list={selectedListForDetails}
          onClose={() => setSelectedListForDetails(null)}
        />
      )}

      {/* Schema Validation Panel - shown inline when validation is triggered */}
      {showValidation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowValidation(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              maxWidth: '700px',
              width: '95%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                <Icon iconName="CheckList" style={{ marginRight: '8px' }} />
                Schema Validation
              </h2>
              <DefaultButton
                iconProps={{ iconName: 'Cancel' }}
                onClick={() => setShowValidation(false)}
                styles={{ root: { minWidth: 'auto' } }}
              />
            </div>
            <SchemaValidation
              selectedSiteColumns={siteColumns.filter(col => selectedItems.get('siteColumns')?.has(col.id))}
              selectedContentTypes={contentTypes.filter(ct => selectedItems.get('contentTypes')?.has(ct.id))}
              selectedLists={lists.filter(list => selectedItems.get('lists')?.has(list.id))}
              allSiteColumns={siteColumns}
              allContentTypes={contentTypes}
              onSelectMissing={handleSelectMissing}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaExplorer;
