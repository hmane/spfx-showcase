// src/webparts/showcase/components/CamlQueryBuilder/components/SiteListSelector.tsx

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  TextField,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import { IListInfo, IFieldInfo } from '../types/CamlTypes';
import { SharePointService } from '../services/SharePointService';

export interface ISiteListSelectorProps {
  initialSiteUrl: string;
  spService: SharePointService;
  onListSelected: (listId: string, listTitle: string, fields: IFieldInfo[]) => void;
  onSiteUrlChange: (siteUrl: string) => void;
}

export const SiteListSelector: React.FC<ISiteListSelectorProps> = ({
  initialSiteUrl,
  spService,
  onListSelected,
  onSiteUrlChange,
}) => {
  const [siteUrl, setSiteUrl] = useState<string>(initialSiteUrl);
  const [lists, setLists] = useState<IListInfo[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);
  const [isLoadingFields, setIsLoadingFields] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load lists from site
  const loadLists = useCallback(async (): Promise<void> => {
    setError('');
    setIsLoadingLists(true);

    try {
      // Update service with new site URL if changed
      if (siteUrl !== spService.getCurrentSiteUrl()) {
        spService.changeSiteUrl(siteUrl);
        onSiteUrlChange(siteUrl);
      }

      const loadedLists = await spService.getLists();
      setLists(loadedLists);

      if (loadedLists.length === 0) {
        setError('No lists found in this site');
      }
    } catch (err) {
      setError(`Failed to load lists: ${err.message}`);
      setLists([]);
    } finally {
      setIsLoadingLists(false);
    }
  }, [siteUrl, spService, onSiteUrlChange]);

  // Load fields when list is selected
  const handleListChange = useCallback(
    async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): Promise<void> => {
      if (option) {
        setSelectedListId(option.key as string);
        setError('');
        setIsLoadingFields(true);

        try {
          const fields = await spService.getListFields(option.key as string);
          onListSelected(option.key as string, option.text, fields);
        } catch (err) {
          setError(`Failed to load fields: ${err.message}`);
        } finally {
          setIsLoadingFields(false);
        }
      }
    },
    [spService, onListSelected]
  );

  // Handle site URL change
  const handleSiteUrlChange = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      setSiteUrl(newValue || '');
    },
    []
  );

  // Load lists on mount
  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  // List options for dropdown
  const listOptions: IDropdownOption[] = lists.map(list => ({
    key: list.id,
    text: `${list.title} (${list.itemCount} items)`,
    data: list,
  }));

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #edebe9',
        borderRadius: '4px',
        background: '#f9f9f9',
        marginBottom: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        Site & List Selection
      </h3>

      {/* Site URL */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <TextField
            label="Site URL"
            value={siteUrl}
            onChange={handleSiteUrlChange}
            placeholder="https://tenant.sharepoint.com/sites/sitename"
            description="Leave default to use current site"
          />
        </div>
        <PrimaryButton
          text="Load Lists"
          iconProps={{ iconName: 'Refresh' }}
          onClick={loadLists}
          disabled={isLoadingLists}
          styles={{ root: { padding: '8px 16px', marginTop: '28px' } }}
        />
      </div>

      {/* Loading indicator */}
      {isLoadingLists && (
        <div style={{ marginBottom: '12px' }}>
          <Spinner size={SpinnerSize.small} label="Loading lists..." />
        </div>
      )}

      {/* List selector */}
      {!isLoadingLists && lists.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <Dropdown
            label="Select List"
            placeholder="Choose a list"
            options={listOptions}
            selectedKey={selectedListId}
            onChange={handleListChange}
            disabled={isLoadingFields}
          />
        </div>
      )}

      {/* Loading fields indicator */}
      {isLoadingFields && (
        <div style={{ marginBottom: '12px' }}>
          <Spinner size={SpinnerSize.small} label="Loading fields..." />
        </div>
      )}

      {/* Error message */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>
          {error}
        </MessageBar>
      )}

      {/* Info message */}
      {!isLoadingLists && !error && lists.length > 0 && selectedListId && !isLoadingFields && (
        <MessageBar messageBarType={MessageBarType.success}>
          List and fields loaded successfully. You can now build your query below.
        </MessageBar>
      )}
    </div>
  );
};
