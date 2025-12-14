// src/webparts/developerToolkit/components/CamlQueryBuilder/components/QueryHistory.tsx

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DefaultButton,
  PrimaryButton,
  IconButton,
  SearchBox,
  MessageBar,
  MessageBarType,
  Icon,
} from '@fluentui/react';
import { IConditionGroup, IOrderByField } from '../types/CamlTypes';

const HISTORY_STORAGE_KEY = 'spfx-caml-query-history';
const MAX_HISTORY_ITEMS = 20;

export interface IQueryHistoryItem {
  id: string;
  name: string;
  camlXML: string;
  listTitle: string;
  siteUrl: string;
  conditionCount: number;
  timestamp: number;
  isFavorite?: boolean;
}

export interface IQueryHistoryProps {
  onApply: (
    group: IConditionGroup,
    orderBy: IOrderByField[],
    viewFields: string[],
    rowLimit: number | null
  ) => void;
  onClose: () => void;
  currentListTitle?: string;
}

// Load history from localStorage
function loadHistory(): IQueryHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as IQueryHistoryItem[];
    }
  } catch (error) {
    console.warn('Failed to load query history:', error);
  }
  return [];
}

// Save history to localStorage
function saveHistory(history: IQueryHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save query history:', error);
  }
}

// Public function to add a query to history
export function addQueryToHistory(
  camlXML: string,
  listTitle: string,
  siteUrl: string,
  conditionCount: number,
  name?: string
): void {
  const history = loadHistory();

  // Check if same query already exists
  const existingIndex = history.findIndex(
    h => h.camlXML === camlXML && h.listTitle === listTitle
  );

  if (existingIndex !== -1) {
    // Update timestamp of existing entry
    history[existingIndex].timestamp = Date.now();
    history[existingIndex].conditionCount = conditionCount;
    // Move to top
    const [existing] = history.splice(existingIndex, 1);
    history.unshift(existing);
  } else {
    // Add new entry
    const newItem: IQueryHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || `Query ${new Date().toLocaleString()}`,
      camlXML,
      listTitle,
      siteUrl,
      conditionCount,
      timestamp: Date.now(),
      isFavorite: false,
    };
    history.unshift(newItem);
  }

  // Limit history size (keep favorites)
  const favorites = history.filter(h => h.isFavorite);
  const nonFavorites = history.filter(h => !h.isFavorite);
  const trimmed = [...favorites, ...nonFavorites.slice(0, MAX_HISTORY_ITEMS - favorites.length)];

  saveHistory(trimmed);
}

export const QueryHistory: React.FC<IQueryHistoryProps> = ({
  onApply,
  onClose,
  currentListTitle,
}) => {
  const [history, setHistory] = useState<IQueryHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCurrentList, setFilterCurrentList] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Filter history
  const filteredHistory = useMemo(() => {
    let items = history;

    // Filter by current list
    if (filterCurrentList && currentListTitle) {
      items = items.filter(h => h.listTitle === currentListTitle);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      items = items.filter(
        h =>
          h.name.toLowerCase().includes(search) ||
          h.listTitle.toLowerCase().includes(search) ||
          h.camlXML.toLowerCase().includes(search)
      );
    }

    // Sort: favorites first, then by timestamp
    return items.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.timestamp - a.timestamp;
    });
  }, [history, searchTerm, filterCurrentList, currentListTitle]);

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string): void => {
    setHistory(prev => {
      const updated = prev.map(h =>
        h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
      );
      saveHistory(updated);
      return updated;
    });
  }, []);

  // Rename item
  const handleRename = useCallback((id: string): void => {
    const item = history.find(h => h.id === id);
    if (!item) return;

    const newName = prompt('Enter new name:', item.name);
    if (newName && newName.trim()) {
      setHistory(prev => {
        const updated = prev.map(h =>
          h.id === id ? { ...h, name: newName.trim() } : h
        );
        saveHistory(updated);
        return updated;
      });
    }
  }, [history]);

  // Delete item
  const handleDelete = useCallback((id: string): void => {
    if (confirm('Are you sure you want to delete this query from history?')) {
      setHistory(prev => {
        const updated = prev.filter(h => h.id !== id);
        saveHistory(updated);
        return updated;
      });
      setMessage('Query deleted from history');
      setTimeout(() => setMessage(''), 3000);
    }
  }, []);

  // Clear all history
  const handleClearAll = useCallback((): void => {
    if (confirm('Are you sure you want to clear all query history? Favorites will be preserved.')) {
      setHistory(prev => {
        const favorites = prev.filter(h => h.isFavorite);
        saveHistory(favorites);
        return favorites;
      });
      setMessage('History cleared (favorites preserved)');
      setTimeout(() => setMessage(''), 3000);
    }
  }, []);

  // Apply query - parse the CAML and apply it
  const handleApply = useCallback(
    (item: IQueryHistoryItem): void => {
      // Import the parser dynamically to avoid circular dependencies
      import('../utils/camlParser')
        .then(({ parseCAMLXML }) => {
          const result = parseCAMLXML(item.camlXML);
          if (result.success && result.query) {
            onApply(
              result.query.where!,
              result.query.orderBy,
              result.query.viewFields,
              result.query.rowLimit
            );
            onClose();
          } else {
            setMessage(`Failed to parse query: ${result.error}`);
            setTimeout(() => setMessage(''), 5000);
          }
        })
        .catch((error) => {
          setMessage(`Failed to load parser: ${error.message}`);
          setTimeout(() => setMessage(''), 5000);
        });
    },
    [onApply, onClose]
  );

  // Copy CAML to clipboard
  const handleCopy = useCallback((camlXML: string): void => {
    navigator.clipboard
      .writeText(camlXML)
      .then(() => {
        setMessage('CAML copied to clipboard');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((error) => {
        setMessage(`Failed to copy: ${error.message}`);
        setTimeout(() => setMessage(''), 3000);
      });
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    // Less than 1 hour ago
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    }

    // Less than 24 hours ago
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    // Less than 7 days ago
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    // Otherwise show date
    return date.toLocaleDateString();
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
          maxWidth: '800px',
          width: '90%',
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
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Query History</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              {history.length} saved {history.length === 1 ? 'query' : 'queries'}
            </p>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Search and Filter */}
        <div style={{ padding: '16px', borderBottom: '1px solid #edebe9' }}>
          <SearchBox
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e, newValue) => setSearchTerm(newValue || '')}
            onClear={() => setSearchTerm('')}
            styles={{ root: { marginBottom: '12px' } }}
          />

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {currentListTitle && (
              <button
                onClick={() => setFilterCurrentList(!filterCurrentList)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #edebe9',
                  borderRadius: '16px',
                  background: filterCurrentList ? '#0078d4' : '#fff',
                  color: filterCurrentList ? '#fff' : '#323130',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Current list: {currentListTitle}
              </button>
            )}
            <DefaultButton
              text="Clear History"
              iconProps={{ iconName: 'Delete' }}
              onClick={handleClearAll}
              disabled={history.filter(h => !h.isFavorite).length === 0}
              styles={{ root: { marginLeft: 'auto' } }}
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <MessageBar
            messageBarType={message.includes('Failed') ? MessageBarType.error : MessageBarType.success}
            onDismiss={() => setMessage('')}
          >
            {message}
          </MessageBar>
        )}

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {filteredHistory.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#605e5c' }}>
              <Icon iconName="History" styles={{ root: { fontSize: '48px', marginBottom: '16px', opacity: 0.5 } }} />
              <h3 style={{ margin: '0 0 8px 0' }}>No queries in history</h3>
              <p style={{ margin: 0 }}>
                {searchTerm || filterCurrentList
                  ? 'Try adjusting your search or filter'
                  : 'Queries you execute will appear here'}
              </p>
            </div>
          )}

          {filteredHistory.map(item => (
            <div
              key={item.id}
              style={{
                border: '1px solid #edebe9',
                borderRadius: '6px',
                padding: '14px',
                marginBottom: '12px',
                transition: 'all 0.2s',
                borderLeft: item.isFavorite ? '3px solid #ffb900' : '1px solid #edebe9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <IconButton
                      iconProps={{
                        iconName: item.isFavorite ? 'FavoriteStarFill' : 'FavoriteStar',
                        styles: { root: { color: item.isFavorite ? '#ffb900' : '#605e5c' } },
                      }}
                      title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={() => handleToggleFavorite(item.id)}
                      styles={{ root: { width: '24px', height: '24px' } }}
                    />
                    <h4
                      style={{ margin: 0, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleRename(item.id)}
                      title="Click to rename"
                    >
                      {item.name}
                    </h4>
                  </div>
                  <div style={{ fontSize: '12px', color: '#605e5c', marginLeft: '32px' }}>
                    <span style={{ marginRight: '16px' }}>
                      <Icon iconName="List" styles={{ root: { marginRight: '4px' } }} />
                      {item.listTitle}
                    </span>
                    <span style={{ marginRight: '16px' }}>
                      <Icon iconName="Filter" styles={{ root: { marginRight: '4px' } }} />
                      {item.conditionCount} condition{item.conditionCount !== 1 ? 's' : ''}
                    </span>
                    <span>
                      <Icon iconName="Clock" styles={{ root: { marginRight: '4px' } }} />
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <IconButton
                    iconProps={{ iconName: 'Copy' }}
                    title="Copy CAML"
                    onClick={() => handleCopy(item.camlXML)}
                    styles={{ root: { width: '32px', height: '32px' } }}
                  />
                  <IconButton
                    iconProps={{ iconName: 'Delete' }}
                    title="Delete"
                    onClick={() => handleDelete(item.id)}
                    styles={{
                      root: { width: '32px', height: '32px' },
                      rootHovered: { background: '#fde7e9', color: '#a80000' },
                    }}
                  />
                </div>
              </div>

              {/* CAML Preview (collapsed) */}
              <details style={{ marginTop: '8px', marginLeft: '32px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#0078d4' }}>
                  View CAML
                </summary>
                <pre
                  style={{
                    margin: '8px 0 0 0',
                    padding: '8px',
                    background: '#f3f2f1',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '150px',
                  }}
                >
                  {item.camlXML}
                </pre>
              </details>

              {/* Apply Button */}
              <div style={{ marginTop: '12px', marginLeft: '32px' }}>
                <PrimaryButton
                  text="Apply Query"
                  iconProps={{ iconName: 'Play' }}
                  onClick={() => handleApply(item)}
                  styles={{ root: { padding: '4px 16px', height: '28px' } }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px',
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
