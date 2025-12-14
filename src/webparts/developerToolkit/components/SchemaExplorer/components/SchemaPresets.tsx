// Schema Presets Component - Save and load schema selections

import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DefaultButton,
  PrimaryButton,
  TextField,
  MessageBar,
  MessageBarType,
  Icon,
  IconButton,
  SearchBox,
} from '@fluentui/react';
import { SchemaCategory } from '../types/SchemaTypes';

const PRESETS_STORAGE_KEY = 'spfx-schema-explorer-presets';

export interface ISchemaPreset {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  siteUrl: string;
  selections: Record<SchemaCategory, string[]>;
  exportFormat: string;
  isFavorite: boolean;
}

export interface ISchemaPresetsProps {
  currentSelections: Map<SchemaCategory, Set<string>>;
  currentSiteUrl: string;
  currentExportFormat: string;
  onApplyPreset: (preset: ISchemaPreset) => void;
  onClose: () => void;
}

// Load presets from localStorage
function loadPresets(): ISchemaPreset[] {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ISchemaPreset[];
    }
  } catch (error) {
    console.warn('Failed to load schema presets:', error);
  }
  return [];
}

// Save presets to localStorage
function savePresets(presets: ISchemaPreset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn('Failed to save schema presets:', error);
  }
}

export const SchemaPresets: React.FC<ISchemaPresetsProps> = ({
  currentSelections,
  currentSiteUrl,
  currentExportFormat,
  onApplyPreset,
  onClose,
}) => {
  const [presets, setPresets] = useState<ISchemaPreset[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDescription, setNewPresetDescription] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // Count total selections
  const totalSelections = useMemo(() => {
    let count = 0;
    currentSelections.forEach(items => {
      count += items.size;
    });
    return count;
  }, [currentSelections]);

  // Filter presets
  const filteredPresets = useMemo(() => {
    let items = presets;

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.siteUrl.toLowerCase().includes(search)
      );
    }

    // Sort: favorites first, then by date
    return items.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [presets, searchText]);

  // Save current selection as preset
  const handleSavePreset = useCallback(() => {
    if (!newPresetName.trim()) {
      setMessage('Please enter a preset name');
      return;
    }

    const selections: Record<SchemaCategory, string[]> = {
      siteSettings: [],
      siteColumns: [],
      contentTypes: [],
      lists: [],
      security: [],
      navigation: [],
      branding: [],
      taxonomy: [],
    };

    currentSelections.forEach((items, category) => {
      selections[category] = Array.from(items);
    });

    const newPreset: ISchemaPreset = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPresetName.trim(),
      description: newPresetDescription.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      siteUrl: currentSiteUrl,
      selections,
      exportFormat: currentExportFormat,
      isFavorite: false,
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    savePresets(updated);

    setNewPresetName('');
    setNewPresetDescription('');
    setShowSaveForm(false);
    setMessage('Preset saved successfully');
    setTimeout(() => setMessage(''), 3000);
  }, [newPresetName, newPresetDescription, currentSelections, currentSiteUrl, currentExportFormat, presets]);

  // Update existing preset
  const handleUpdatePreset = useCallback((id: string) => {
    const selections: Record<SchemaCategory, string[]> = {
      siteSettings: [],
      siteColumns: [],
      contentTypes: [],
      lists: [],
      security: [],
      navigation: [],
      branding: [],
      taxonomy: [],
    };

    currentSelections.forEach((items, category) => {
      selections[category] = Array.from(items);
    });

    const updated = presets.map(p =>
      p.id === id
        ? { ...p, selections, updatedAt: Date.now(), siteUrl: currentSiteUrl, exportFormat: currentExportFormat }
        : p
    );
    setPresets(updated);
    savePresets(updated);
    setMessage('Preset updated');
    setTimeout(() => setMessage(''), 3000);
  }, [currentSelections, currentSiteUrl, currentExportFormat, presets]);

  // Delete preset
  const handleDeletePreset = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      const updated = presets.filter(p => p.id !== id);
      setPresets(updated);
      savePresets(updated);
      setMessage('Preset deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  }, [presets]);

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string) => {
    const updated = presets.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setPresets(updated);
    savePresets(updated);
  }, [presets]);

  // Rename preset
  const handleRename = useCallback((id: string, newName: string) => {
    const updated = presets.map(p =>
      p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p
    );
    setPresets(updated);
    savePresets(updated);
    setEditingId(null);
  }, [presets]);

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count selections in preset
  const countPresetSelections = (preset: ISchemaPreset): number => {
    return Object.values(preset.selections).reduce((sum, arr) => sum + arr.length, 0);
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          maxWidth: '700px',
          width: '95%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              <Icon iconName="FavoriteList" style={{ marginRight: '8px' }} />
              Schema Presets
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Save and load schema selection presets
            </p>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Message */}
        {message && (
          <MessageBar
            messageBarType={message.includes('success') || message.includes('saved') ? MessageBarType.success : MessageBarType.info}
            onDismiss={() => setMessage('')}
          >
            {message}
          </MessageBar>
        )}

        {/* Save Form */}
        {showSaveForm ? (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #edebe9', background: '#faf9f8' }}>
            <div style={{ marginBottom: '12px' }}>
              <TextField
                label="Preset Name"
                required
                value={newPresetName}
                onChange={(_, v) => setNewPresetName(v || '')}
                placeholder="My Schema Preset"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <TextField
                label="Description"
                value={newPresetDescription}
                onChange={(_, v) => setNewPresetDescription(v || '')}
                placeholder="Optional description..."
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <PrimaryButton
                text="Save Preset"
                iconProps={{ iconName: 'Save' }}
                onClick={handleSavePreset}
                disabled={!newPresetName.trim() || totalSelections === 0}
              />
              <DefaultButton
                text="Cancel"
                onClick={() => setShowSaveForm(false)}
              />
            </div>
            {totalSelections === 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#a80000' }}>
                No items selected. Select some items first.
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #edebe9' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <PrimaryButton
                text={`Save Current (${totalSelections} items)`}
                iconProps={{ iconName: 'Save' }}
                onClick={() => setShowSaveForm(true)}
                disabled={totalSelections === 0}
              />
            </div>
            <SearchBox
              placeholder="Search presets..."
              value={searchText}
              onChange={(_, v) => setSearchText(v || '')}
            />
          </div>
        )}

        {/* Presets List */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {filteredPresets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#605e5c' }}>
              <Icon iconName="FavoriteList" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '14px' }}>
                {searchText ? 'No presets match your search' : 'No saved presets'}
              </div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Save your current selection to create a preset
              </div>
            </div>
          ) : (
            filteredPresets.map(preset => (
              <div
                key={preset.id}
                style={{
                  padding: '14px',
                  border: '1px solid #edebe9',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  borderLeft: preset.isFavorite ? '3px solid #ffb900' : '1px solid #edebe9',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconButton
                        iconProps={{
                          iconName: preset.isFavorite ? 'FavoriteStarFill' : 'FavoriteStar',
                          styles: { root: { color: preset.isFavorite ? '#ffb900' : '#605e5c' } },
                        }}
                        title={preset.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        onClick={() => handleToggleFavorite(preset.id)}
                        styles={{ root: { width: '24px', height: '24px' } }}
                      />
                      {editingId === preset.id ? (
                        <TextField
                          value={preset.name}
                          onChange={(_, v) => {
                            const updated = presets.map(p =>
                              p.id === preset.id ? { ...p, name: v || '' } : p
                            );
                            setPresets(updated);
                          }}
                          onBlur={() => handleRename(preset.id, preset.name)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename(preset.id, preset.name);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          styles={{ root: { width: '200px' } }}
                          autoFocus
                        />
                      ) : (
                        <span
                          style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                          onClick={() => setEditingId(preset.id)}
                          title="Click to rename"
                        >
                          {preset.name}
                        </span>
                      )}
                    </div>
                    {preset.description && (
                      <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px', marginLeft: '32px' }}>
                        {preset.description}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#605e5c', marginTop: '8px', marginLeft: '32px' }}>
                      <span>{countPresetSelections(preset)} items</span>
                      <span style={{ margin: '0 8px' }}>•</span>
                      <span>{formatDate(preset.updatedAt)}</span>
                    </div>
                    {/* Selection summary */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginLeft: '32px', flexWrap: 'wrap' }}>
                      {preset.selections.siteColumns.length > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px' }}>
                          {preset.selections.siteColumns.length} columns
                        </span>
                      )}
                      {preset.selections.contentTypes.length > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px' }}>
                          {preset.selections.contentTypes.length} content types
                        </span>
                      )}
                      {preset.selections.lists.length > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px' }}>
                          {preset.selections.lists.length} lists
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <IconButton
                      iconProps={{ iconName: 'Refresh' }}
                      title="Update with current selection"
                      onClick={() => handleUpdatePreset(preset.id)}
                      styles={{ root: { width: '32px', height: '32px' } }}
                    />
                    <IconButton
                      iconProps={{ iconName: 'Delete' }}
                      title="Delete"
                      onClick={() => handleDeletePreset(preset.id)}
                      styles={{
                        root: { width: '32px', height: '32px' },
                        rootHovered: { background: '#fde7e9', color: '#a80000' },
                      }}
                    />
                  </div>
                </div>

                {/* Apply button */}
                <div style={{ marginTop: '12px', marginLeft: '32px' }}>
                  <PrimaryButton
                    text="Apply Preset"
                    iconProps={{ iconName: 'Play' }}
                    onClick={() => {
                      onApplyPreset(preset);
                      onClose();
                    }}
                    styles={{ root: { padding: '4px 16px', height: '28px' } }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <DefaultButton text="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};
